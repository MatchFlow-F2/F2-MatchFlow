export const AuthGuard = {
  checkAccess(requiredRole) {
    const userData = localStorage.getItem('user');

    if (!userData) {
      window.location.replace('../login/index.html');
      return;
    }

    const user = JSON.parse(userData);

    if (user.role !== requiredRole) {
      const path =
        user.role === 'company'
          ? '../dashboard/index.html'
          : '../candidates/index.html';
      window.location.replace(path);
    }
  },

  logout() {
    localStorage.removeItem('user');
    window.location.replace('../login/index.html');
  },
};
