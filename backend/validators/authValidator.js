import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(50, 'Tên không được vượt quá 50 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu không hợp lệ'), // don't give away password rules on login
  }),
});

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error.name === 'ZodError' || error instanceof z.ZodError) {
      return res.status(400).json({
        message: error.issues ? error.issues[0].message : 'Dữ liệu đầu vào không hợp lệ',
        errors: error.issues?.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    console.error('Validation error fallback:', error);
    return res.status(400).json({ message: 'Lỗi xác thực: ' + (error.message || 'Dữ liệu không hợp lệ') });
  }
};
