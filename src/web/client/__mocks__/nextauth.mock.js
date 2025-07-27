const NextAuth = jest.fn().mockImplementation((options) => {
  // Return a middleware function that can handle requests
  return (req, res, next) => {
    // Mock NextAuth handler behavior
    if (req.path === '/session') {
      res.json({ user: null, expires: new Date().toISOString() });
    } else if (req.path === '/signin') {
      res.json({ url: '/auth/signin' });
    } else if (req.path === '/signout') {
      res.json({ url: '/' });
    } else {
      res.status(404).json({ error: 'NextAuth endpoint not found' });
    }
  };
});

// Add static methods
NextAuth.getServerSession = jest.fn().mockResolvedValue(null);
NextAuth.getSession = jest.fn().mockResolvedValue(null);
NextAuth.signIn = jest.fn().mockResolvedValue({ ok: true });
NextAuth.signOut = jest.fn().mockResolvedValue({ ok: true });
NextAuth.useSession = jest.fn().mockReturnValue({
  data: null,
  status: 'unauthenticated',
  update: jest.fn()
});

module.exports = NextAuth;
module.exports.default = NextAuth; 