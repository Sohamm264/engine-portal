const express = require('express');
const router = express.Router();

const sendInviteEmail = require('../sendMail');

// TEST ROUTE
router.get('/', (req, res) => {
  res.json({
    message: 'Users route working'
  });
});

// INVITE ROUTE
router.post('/invite', async (req, res) => {

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  try {

    // SEND EMAIL
    await sendInviteEmail(email);

    res.json({
      success: true,
      message: 'Invitation sent successfully'
    });

  } catch (err) {

    console.error('Invite Error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to send invitation'
    });

  }

});

module.exports = router;