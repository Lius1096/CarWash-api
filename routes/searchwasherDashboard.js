// /routes/searchwasherDashboard.js
router.get('/history', authMiddleware, getServiceHistory);
router.get('/payments', authMiddleware, getPaymentHistory);
router.get('/ratings', authMiddleware, getGivenRatings);
