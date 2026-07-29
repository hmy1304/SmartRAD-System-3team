<<<<<<< HEAD
-- Fix ADMIN-001 and RN-1004 passwords to correctly match the BCrypt hash for '1234'
UPDATE employee 
SET password = '$2a$10$Wt4s64H3mVRZNx0CFzUmW.6hmDF8PFANNna4OdivYVoayHXPH..fm' 
WHERE emp_no IN ('ADMIN-001', 'RN-1004');
=======
-- Fix ADMIN-001, RN-1004, RN-2001 (and all plaintext '1234') passwords to correctly match the BCrypt hash for '1234'
UPDATE employee 
SET password = '$2a$10$Wt4s64H3mVRZNx0CFzUmW.6hmDF8PFANNna4OdivYVoayHXPH..fm' 
WHERE emp_no IN ('ADMIN-001', 'RN-1004', 'RN-2001') OR password = '1234';
>>>>>>> e4aeb421f7d3e5cae72099ee9ba963ba6ea31d3f
