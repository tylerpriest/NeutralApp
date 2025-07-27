module.exports = {
  Issuer: {
    discover: jest.fn().mockResolvedValue({
      Client: jest.fn().mockReturnValue({
        authorizationUrl: jest.fn().mockReturnValue('https://example.com/auth'),
        callbackParams: jest.fn().mockReturnValue({}),
        callback: jest.fn().mockResolvedValue({
          claims: jest.fn().mockReturnValue({}),
          access_token: 'mock-token'
        })
      })
    })
  }
}; 