const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const Team = require('../models/Team');
const TeamMember = require('../models/TeamMember');
const TeamInvitation = require('../models/TeamInvitation');
const TeamActivityLog = require('../models/TeamActivityLog');
const User = require('../models/User');

// Public route to verify invitation token (used on Signup page)
router.get('/invite/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const invitation = await TeamInvitation.findOne({ invite_token: token, status: 'Pending' }).populate('team_id');
    
    if (!invitation || !invitation.team_id) {
      return res.status(404).json({ valid: false, error: 'Invitation link is invalid or has already been used.' });
    }

    if (invitation.expires_at && new Date() > invitation.expires_at) {
      invitation.status = 'Expired';
      await invitation.save();
      return res.status(400).json({ valid: false, error: 'Invitation link has expired.' });
    }

    res.json({
      valid: true,
      invite_token: token,
      team_id: invitation.team_id._id,
      team_name: invitation.team_id.team_name
    });
  } catch (error) {
    console.error('Verify invitation error:', error);
    res.status(500).json({ error: 'Server error verifying invitation token' });
  }
});

// All routes below require authentication
router.use(auth);

// GET current team details, members, and pending invites
router.get('/current', async (req, res) => {
  try {
    const team = await Team.findById(req.teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const members = await TeamMember.find({ team_id: req.teamId, status: { $ne: 'Removed' } })
      .populate('user_id', 'username firstName lastName createdAt')
      .sort({ createdAt: 1 });

    const invitations = await TeamInvitation.find({ team_id: req.teamId, status: 'Pending' }).sort({ createdAt: -1 });

    const formattedMembers = members.map(m => ({
      id: m._id,
      _id: m._id,
      user_id: m.user_id ? m.user_id._id : null,
      username: m.user_id ? m.user_id.username : 'Unknown',
      name: m.user_id ? `${m.user_id.firstName || ''} ${m.user_id.lastName || ''}`.trim() || m.user_id.username : 'Unknown',
      role: m.role,
      status: m.status,
      joined_at: m.joined_at || m.createdAt
    }));

    res.json({
      id: team._id,
      _id: team._id,
      team_name: team.team_name,
      owner_user_id: team.owner_user_id,
      current_user_role: req.teamRole,
      total_members: formattedMembers.length,
      members: formattedMembers,
      pending_invitations: invitations.map(i => ({
        id: i._id,
        _id: i._id,
        invite_token: i.invite_token,
        invited_email: i.invited_email,
        invited_phone: i.invited_phone,
        status: i.status,
        createdAt: i.createdAt
      }))
    });
  } catch (error) {
    console.error('Get current team error:', error);
    res.status(500).json({ error: 'Server error fetching team details' });
  }
});

// PUT update team name (Owner only)
router.put('/name', async (req, res) => {
  try {
    const { team_name } = req.body;
    if (!team_name || !team_name.trim()) {
      return res.status(400).json({ error: 'Team name cannot be empty' });
    }

    if (req.teamRole !== 'Owner') {
      return res.status(403).json({ error: 'Only the Team Owner can change the team name' });
    }

    const team = await Team.findById(req.teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const oldName = team.team_name;
    team.team_name = team_name.trim();
    await team.save();

    // Log Activity
    const currentUser = await User.findById(req.userId);
    await new TeamActivityLog({
      team_id: team._id,
      action: 'TEAM_RENAMED',
      description: `Team name changed from "${oldName}" to "${team.team_name}".`,
      performed_by: currentUser ? (currentUser.username || currentUser.firstName || 'Owner') : 'Owner'
    }).save();

    res.json({ id: team._id, team_name: team.team_name });
  } catch (error) {
    console.error('Update team name error:', error);
    res.status(500).json({ error: 'Server error updating team name' });
  }
});

// POST create invitation link
router.post('/invite', async (req, res) => {
  try {
    const { invited_email, invited_phone } = req.body;

    const inviteToken = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiry

    const invitation = new TeamInvitation({
      team_id: req.teamId,
      invite_token: inviteToken,
      invited_email: invited_email || '',
      invited_phone: invited_phone || '',
      created_by: req.userId,
      expires_at: expiresAt,
      status: 'Pending'
    });

    await invitation.save();

    // Log Activity
    const currentUser = await User.findById(req.userId);
    const perfBy = currentUser ? (currentUser.username || currentUser.firstName || 'Owner') : 'Owner';
    await new TeamActivityLog({
      team_id: req.teamId,
      action: 'MEMBER_INVITED',
      description: `${perfBy} generated a team invitation link.`,
      performed_by: perfBy
    }).save();

    res.json({
      id: invitation._id,
      invite_token: invitation.invite_token,
      invited_email: invitation.invited_email,
      invited_phone: invitation.invited_phone,
      expires_at: invitation.expires_at,
      status: invitation.status
    });
  } catch (error) {
    console.error('Create team invite error:', error);
    res.status(500).json({ error: 'Server error creating invitation' });
  }
});

// POST accept invitation for existing logged-in user
router.post('/invite/accept', async (req, res) => {
  try {
    const { invite_token } = req.body;
    if (!invite_token) return res.status(400).json({ error: 'Invitation token is required' });

    const invitation = await TeamInvitation.findOne({ invite_token, status: 'Pending' }).populate('team_id');
    if (!invitation || !invitation.team_id) {
      return res.status(404).json({ error: 'Invitation link is invalid or expired' });
    }

    if (invitation.expires_at && new Date() > invitation.expires_at) {
      invitation.status = 'Expired';
      await invitation.save();
      return res.status(400).json({ error: 'Invitation link has expired' });
    }

    // Set previous team memberships for this user to inactive/removed
    await TeamMember.updateMany({ user_id: req.userId }, { $set: { status: 'Removed' } });

    // Add user to the new team
    const newMember = new TeamMember({
      team_id: invitation.team_id._id,
      user_id: req.userId,
      role: 'Member',
      status: 'Active',
      joined_at: new Date()
    });
    await newMember.save();

    // Update invitation
    invitation.status = 'Accepted';
    invitation.accepted_at = new Date();
    await invitation.save();

    // Log Activity
    const user = await User.findById(req.userId);
    const username = user ? (user.username || user.firstName || 'Member') : 'Member';
    await new TeamActivityLog({
      team_id: invitation.team_id._id,
      action: 'MEMBER_JOINED',
      description: `${username} accepted invitation and joined the team.`,
      performed_by: username
    }).save();

    res.json({ success: true, message: `Joined ${invitation.team_id.team_name} successfully` });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Server error accepting invitation' });
  }
});

// POST decline invitation for existing logged-in user
router.post('/invite/decline', async (req, res) => {
  try {
    const { invite_token } = req.body;
    if (!invite_token) return res.status(400).json({ error: 'Invitation token is required' });

    const invitation = await TeamInvitation.findOne({ invite_token, status: 'Pending' });
    if (invitation) {
      invitation.status = 'Cancelled';
      await invitation.save();

      const user = await User.findById(req.userId);
      const username = user ? (user.username || user.firstName || 'User') : 'User';

      await new TeamActivityLog({
        team_id: invitation.team_id,
        action: 'INVITATION_DECLINED',
        description: `${username} declined the team invitation.`,
        performed_by: username
      }).save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Decline invitation error:', error);
    res.status(500).json({ error: 'Server error declining invitation' });
  }
});

// Handler function for disabling/removing member (Owner only)
const disableMemberHandler = async (req, res) => {
  try {
    if (req.teamRole !== 'Owner') {
      return res.status(403).json({ error: 'Only the Team Owner can disable user' });
    }

    const { memberId } = req.params;
    const isObjId = mongoose.Types.ObjectId.isValid(memberId);
    
    let query = { team_id: req.teamId };
    if (isObjId) {
      query.$or = [{ _id: memberId }, { user_id: memberId }];
    } else {
      query._id = memberId;
    }

    const member = await TeamMember.findOne(query);
    if (!member) return res.status(404).json({ error: 'Team member not found' });

    if (member.role === 'Owner') {
      return res.status(400).json({ error: 'Team Owner cannot be disabled' });
    }

    member.status = 'Disabled';
    await member.save();

    const targetUser = await User.findById(member.user_id);
    if (targetUser) {
      targetUser.status = 'Disabled';
      await targetUser.save();
    }

    const currentUser = await User.findById(req.userId);
    const targetName = targetUser ? (targetUser.username || targetUser.firstName || 'Member') : 'Member';
    const ownerName = currentUser ? (currentUser.username || currentUser.firstName || 'Owner') : 'Owner';

    await new TeamActivityLog({
      team_id: req.teamId,
      action: 'MEMBER_DISABLED',
      description: `${targetName} was disabled by ${ownerName}.`,
      performed_by: ownerName
    }).save();

    res.json({ success: true, message: 'User disabled successfully' });
  } catch (error) {
    console.error('Disable member error:', error);
    res.status(500).json({ error: 'Server error disabling user' });
  }
};

router.post('/members/:memberId/disable', disableMemberHandler);
router.post('/members/:memberId/remove', disableMemberHandler);
router.delete('/members/:memberId', disableMemberHandler);

// Handler function for enabling member (Owner only)
const enableMemberHandler = async (req, res) => {
  try {
    if (req.teamRole !== 'Owner') {
      return res.status(403).json({ error: 'Only the Team Owner can enable user' });
    }

    const { memberId } = req.params;
    const isObjId = mongoose.Types.ObjectId.isValid(memberId);
    
    let query = { team_id: req.teamId };
    if (isObjId) {
      query.$or = [{ _id: memberId }, { user_id: memberId }];
    } else {
      query._id = memberId;
    }

    const member = await TeamMember.findOne(query);
    if (!member) return res.status(404).json({ error: 'Team member not found' });

    member.status = 'Active';
    await member.save();

    const targetUser = await User.findById(member.user_id);
    if (targetUser) {
      targetUser.status = 'Active';
      await targetUser.save();
    }

    const currentUser = await User.findById(req.userId);
    const targetName = targetUser ? (targetUser.username || targetUser.firstName || 'Member') : 'Member';
    const ownerName = currentUser ? (currentUser.username || currentUser.firstName || 'Owner') : 'Owner';

    await new TeamActivityLog({
      team_id: req.teamId,
      action: 'MEMBER_ENABLED',
      description: `${targetName} was re-enabled by ${ownerName}.`,
      performed_by: ownerName
    }).save();

    res.json({ success: true, message: 'User re-enabled successfully' });
  } catch (error) {
    console.error('Enable member error:', error);
    res.status(500).json({ error: 'Server error enabling user' });
  }
};

router.post('/members/:memberId/enable', enableMemberHandler);

// GET team activity logs
router.get('/activity', async (req, res) => {
  try {
    const logs = await TeamActivityLog.find({ team_id: req.teamId }).sort({ timestamp: -1 }).limit(50);
    res.json(logs);
  } catch (error) {
    console.error('Fetch team activity error:', error);
    res.status(500).json({ error: 'Server error fetching activity logs' });
  }
});

module.exports = router;
