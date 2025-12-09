import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

const mockSendMail = jest.fn();
(nodemailer.createTransport as jest.Mock).mockReturnValue({
  sendMail: mockSendMail,
});

import { emailService } from '../src/services/email';

describe('EmailService', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  const TEST_EMAIL = 'test@example.com';
  const DEFAULT_USER_NAME = 'John Doe';
  const TEST_MESSAGE_ID = 'test-message-id';
  const EMAIL_SUBJECT = 'Welcome to Pokémon Teams';

  const getSentEmail = () => mockSendMail.mock.calls[0][0];

  const mockSuccessfulSend = () => {
    mockSendMail.mockResolvedValue({ messageId: TEST_MESSAGE_ID });
  };

  const mockFailedSend = (errorMessage = 'SMTP connection failed') => {
    mockSendMail.mockRejectedValue(new Error(errorMessage));
  };

  beforeEach(() => {
    mockSendMail.mockClear();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      mockSuccessfulSend();

      await emailService.sendWelcomeEmail(TEST_EMAIL, DEFAULT_USER_NAME);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        to: TEST_EMAIL,
        subject: EMAIL_SUBJECT,
        html: expect.stringContaining(DEFAULT_USER_NAME),
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `Welcome email sent successfully to ${TEST_EMAIL}`,
      );
    });

    it('should include user name in email template', async () => {
      const userName = 'Jane Smith';
      mockSuccessfulSend();

      await emailService.sendWelcomeEmail(TEST_EMAIL, userName);

      const emailCall = getSentEmail();
      expect(emailCall.html).toContain(`Hello ${userName}`);
      expect(emailCall.html).toContain(EMAIL_SUBJECT);
    });

    it('should log error when email sending fails', async () => {
      const userName = 'Carlos Lopez';
      mockFailedSend();

      await emailService.sendWelcomeEmail(TEST_EMAIL, userName);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Error sending welcome email to ${TEST_EMAIL}:`,
        expect.any(Error),
      );
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should handle errors without throwing exceptions (fire-and-forget)', async () => {
      mockFailedSend('Network error');

      await expect(
        emailService.sendWelcomeEmail(TEST_EMAIL, DEFAULT_USER_NAME),
      ).resolves.not.toThrow();
    });

    it('should send email with correct subject', async () => {
      mockSuccessfulSend();

      await emailService.sendWelcomeEmail(TEST_EMAIL, DEFAULT_USER_NAME);

      const emailCall = getSentEmail();
      expect(emailCall.subject).toBe(EMAIL_SUBJECT);
    });

    it('should use HTML format in email', async () => {
      mockSuccessfulSend();

      await emailService.sendWelcomeEmail(TEST_EMAIL, DEFAULT_USER_NAME);

      const emailCall = getSentEmail();
      expect(emailCall.html).toBeDefined();
      expect(emailCall.html).toContain('html');
      expect(emailCall.html).toContain('<!DOCTYPE html>');
    });

    it('should include platform information in template', async () => {
      mockSuccessfulSend();

      await emailService.sendWelcomeEmail(TEST_EMAIL, DEFAULT_USER_NAME);

      const emailCall = getSentEmail();
      expect(emailCall.html).toContain('Pokémon Teams');
      expect(emailCall.html).toContain('excited to have you with us');
    });
  });
});
