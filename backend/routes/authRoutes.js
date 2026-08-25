const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const Team = require('../models/Team');
const TeamMember = require('../models/TeamMember');
const TeamInvitation = require('../models/TeamInvitation');
const TeamActivityLog = require('../models/TeamActivityLog');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { username, password, inviteToken, joinTeam = true } = req.body;
    
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, password: hashedPassword });
    await user.save();

    let targetTeamId = null;
    let userRole = 'Owner';

    // Handle Team Join if invite token provided & joinTeam checked
    if (inviteToken && joinTeam) {
      const invitation = await TeamInvitation.findOne({ invite_token: inviteToken, status: 'Pending' }).populate('team_id');
      if (invitation && invitation.team_id && (!invitation.expires_at || new Date() <= invitation.expires_at)) {
        targetTeamId = invitation.team_id._id;
        userRole = 'Member';

        await new TeamMember({
          team_id: targetTeamId,
          user_id: user._id,
          role: 'Member',
          status: 'Active',
          joined_at: new Date()
        }).save();

        invitation.status = 'Accepted';
        invitation.accepted_at = new Date();
        await invitation.save();

        await new TeamActivityLog({
          team_id: targetTeamId,
          action: 'MEMBER_JOINED',
          description: `${username} joined the team.`,
          performed_by: username
        }).save();
      }
    }

    // Fallback: Create personal team if not joining an invited team
    if (!targetTeamId) {
      const teamName = `${username}'s Team`;
      const team = new Team({
        team_name: teamName,
        owner_user_id: user._id
      });
      await team.save();
      targetTeamId = team._id;

      await new TeamMember({
        team_id: team._id,
        user_id: user._id,
        role: 'Owner',
        status: 'Active'
      }).save();

      await new TeamActivityLog({
        team_id: team._id,
        action: 'TEAM_CREATED',
        description: `Team "${teamName}" created.`,
        performed_by: username
      }).save();
    }

    const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_for_mystore';
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });
    res.json({ token, username, role: userRole });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup', details: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password, inviteToken } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (user.status === 'Disabled') {
      return res.status(403).json({ error: 'Your account is disabled' });
    }

    const disabledMember = await TeamMember.findOne({ user_id: user._id, status: 'Disabled' });
    if (disabledMember) {
      return res.status(403).json({ error: 'Your account is disabled' });
    }

    let pendingInvite = null;

    // Check if invite token provided in login request
    if (inviteToken) {
      const invitation = await TeamInvitation.findOne({ invite_token: inviteToken, status: 'Pending' }).populate('team_id');
      if (invitation && invitation.team_id && (!invitation.expires_at || new Date() <= invitation.expires_at)) {
        pendingInvite = {
          invite_token: invitation.invite_token,
          team_id: invitation.team_id._id,
          team_name: invitation.team_id.team_name
        };
      }
    }

    const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_for_mystore';
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });
    res.json({ token, username, pendingInvite });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId || req.user?.userId;
    
    // Find the current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Save
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error during password change' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.userId || req.user?.userId;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const userId = req.userId || req.user?.userId;
    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

// DELETE user account (Self or Admin)
router.delete('/account', auth, async (req, res) => {
  try {
    const userId = req.userId || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Remove user team member records
    await TeamMember.deleteMany({ user_id: userId });

    // Clean up invitations created by user
    await TeamInvitation.deleteMany({ created_by: userId });

    // Delete user record
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Server error deleting user account' });
  }
});

// DELETE user by ID (Owner/Admin or self)
router.delete('/users/:id', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.userId || req.user?.userId;

    // Remove target user's team member records
    await TeamMember.deleteMany({ user_id: targetUserId });

    // Delete user record
    await User.findByIdAndDelete(targetUserId);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user by ID error:', error);
    res.status(500).json({ error: 'Server error deleting user' });
  }
});

module.exports = router;
