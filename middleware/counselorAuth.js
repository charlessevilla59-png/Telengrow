/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

export const isCounselor = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  if (req.user && req.user.role === 'counselor') {
    return next();
  }

  res.status(403).render('404', { 
    title: 'Access Denied',
    message: 'Counselor access required' 
  });
};

export const isCounselorOrAdmin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  if (req.user && (req.user.role === 'counselor' || req.user.role === 'admin')) {
    return next();
  }

  res.status(403).render('404', { 
    title: 'Access Denied',
    message: 'Counselor or Admin access required' 
  });
};
