// Route protection
export const AuthGuard = {
  /**
   * Checks if a user is logged in and has the correct role.
   * @param {string} requiredRole - company or candidate
   */
  checkAccess(requiredRole) {
    const userData = localStorage.getItem('user');

    // Verify if the user exists
    if (!userData) {
      console.warn('Access denied: No user session found.');
      window.location.href = 'index.html';
      return;
    }

    const user = JSON.parse(userData);

    // Verify whether the current roles match
    if (user.role !== requiredRole) {
      console.error(
        `Access denied: Required role ${requiredRole}, but user is ${user.role}`
      );

      if (user.role === 'company') {
        window.location.href = '/src/pages/company-dashboard/index.html';
      } else if (user.role === 'candidate') {
        window.location.href = '/src/pages/candidate-dashboard/index.html';
      } else {
        window.location.href = '/src/pages/login/index.html';
      }
    }
  },

  // REMOVE SESSION - REDIRECT TO LOGIN
  logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  },
};
