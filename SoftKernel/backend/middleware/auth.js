import LoggerService from '../services/loggerService.js';

/**
 * Verify that the request comes from the claimed wallet address.
 * Expects header: X-Wallet-Address
 * 
 * For production, this should use signature verification (EIP-191/EIP-712),
 * but for the current architecture we enforce that:
 * 1. A wallet address must be provided
 * 2. Route-level checks ensure callers can only access their own data
 */
export const requireWallet = (req, res, next) => {
  const walletAddress = (
    req.headers['x-wallet-address'] ||
    req.body?.employerAddress ||
    req.body?.walletAddress
  )?.toLowerCase();

  if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    LoggerService.logSecurity({
      level: 'warn',
      message: 'Request without valid wallet address',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { path: req.path, method: req.method },
    });

    return res.status(401).json({
      success: false,
      error: 'Wallet address required. Send X-Wallet-Address header.',
    });
  }

  req.walletAddress = walletAddress;
  next();
};

/**
 * Verify that the authenticated wallet matches the resource owner.
 * Prevents users from accessing other users' data.
 * @param {string} paramName - The route param or body field to check against
 */
export const requireOwnership = (paramName = 'employerAddress') => {
  return (req, res, next) => {
    const resourceOwner = (
      req.params[paramName] || req.body?.[paramName]
    )?.toLowerCase();

    if (!resourceOwner) {
      return next(); // No ownership check needed
    }

    if (!req.walletAddress) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (req.walletAddress !== resourceOwner) {
      LoggerService.logSecurity({
        level: 'warn',
        message: 'Ownership check failed - accessing another user\'s data',
        userAddress: req.walletAddress,
        ip: req.ip,
        details: {
          requested: resourceOwner,
          caller: req.walletAddress,
          path: req.path,
        },
        tags: ['unauthorized', 'ownership'],
      });

      return res.status(403).json({
        success: false,
        error: 'You can only access your own data',
      });
    }

    next();
  };
};

export default { requireWallet, requireOwnership };
