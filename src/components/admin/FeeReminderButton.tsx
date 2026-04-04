import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Send, Loader2, Copy, Phone } from 'lucide-react';
import { toast } from '@/hooks/useToast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { openWhatsAppConversation } from '@/utils/whatsapp';

interface FeeReminderButtonProps {
  studentName: string;
  parentName: string;
  parentContact: string;
  amount: number;
  month: number;
  year: number;
  studentEmail?: string;
  parentEmail?: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function FeeReminderButton({
  studentName,
  parentName,
  parentContact,
  amount,
  month,
  year,
  studentEmail = '',
  parentEmail = '',
}: FeeReminderButtonProps) {
  const normalizeEmail = (value?: string | null) => {
    const trimmed = (value || '').trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : '';
  };

  const fallbackParentEmail =
    normalizeEmail(parentEmail) || normalizeEmail(parentContact);
  const preferredEmail = normalizeEmail(studentEmail) || fallbackParentEmail;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState(preferredEmail);
  const [message, setMessage] = useState('');

  const defaultMessage = `Dear ${parentName},

This is a friendly reminder that the fee of ₹${amount.toLocaleString()} for ${studentName}'s training for ${MONTH_NAMES[month - 1]} ${year} is pending.

Please clear the dues at your earliest convenience.

Thank you,
Ghatak Sports Academy`;

  const handleOpenDialog = () => {
    setEmail(preferredEmail);
    setMessage(defaultMessage);
    setDialogOpen(true);
  };

  const openWhatsAppReminder = () => {
    const whatsappMsg = `Namaste ${parentName} ji,\n\nThis is a reminder that the fee of ₹${amount.toLocaleString()} for ${studentName}'s training for ${MONTH_NAMES[month - 1]} ${year} is pending.\n\nKindly clear the dues at your earliest convenience.\n\n📞 +91 63941 35988\n✉️ ghatakgsai@gmail.com\n\n- Ghatak Sports Academy India`;
    const opened = openWhatsAppConversation(parentContact, whatsappMsg);

    if (!opened) {
      toast({
        title: 'WhatsApp Unavailable',
        description: 'Could not open WhatsApp for this parent contact.',
        variant: 'error' as any,
      });
      return false;
    }

    toast({
      title: 'WhatsApp Opened',
      description: `Reminder opened for ${parentName}.`,
    });
    return true;
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailToUse = normalizeEmail(email);
    if (!emailToUse) {
      toast({
        title: 'Invalid Email',
        description:
          'No valid student/parent email found. Use WhatsApp reminder.',
        variant: 'error' as any,
      });
      return;
    }

    setSending(true);

    try {
      const { sendEmail, buildFeeReminderEmail } =
        await import('@/utils/resendEmail');

      // Send email via Resend
      const emailPayload = buildFeeReminderEmail({
        parentName,
        studentName,
        amount,
        month: MONTH_NAMES[month - 1],
        year,
      });
      emailPayload.to = emailToUse;

      const emailSent = await sendEmail(emailPayload);

      toast({
        title: emailSent ? 'Email Sent' : 'Email Failed',
        description: emailSent
          ? `Reminder email sent to ${emailToUse}.`
          : `Could not send reminder email to ${emailToUse}.`,
        variant: emailSent ? ('success' as any) : ('error' as any),
      });

      if (emailSent) {
        setDialogOpen(false);
      }
    } catch {
      toast({
        title: 'Email Error',
        description: 'Failed to send email. Please try again.',
        variant: 'error' as any,
      });
    } finally {
      setSending(false);
    }
  };

  const handleWhatsAppClick = () => {
    const opened = openWhatsAppReminder();
    if (opened) {
      setDialogOpen(false);
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      toast({
        title: 'Copied',
        description: 'WhatsApp message copied. You can paste it manually.',
      });
    } catch {
      toast({
        title: 'Copy Failed',
        description: 'Clipboard is blocked. Please copy the text manually.',
        variant: 'error' as any,
      });
    }
  };

  const handleCopyParentNumber = async () => {
    try {
      await navigator.clipboard.writeText(parentContact);
      toast({
        title: 'Copied',
        description: 'Parent number copied to clipboard.',
      });
    } catch {
      toast({
        title: 'Copy Failed',
        description: 'Clipboard is blocked. Please copy the number manually.',
        variant: 'error' as any,
      });
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenDialog}
        className="h-8 w-full min-w-0 gap-1.5 rounded-lg px-2 text-xs sm:h-9"
      >
        <Mail className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">Remind</span>
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Send Fee Reminder
            </DialogTitle>
            <DialogDescription>
              Send a payment reminder to {parentName} for {studentName}'s
              pending fees via email or WhatsApp.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Student/Parent Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="student-or-parent@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">
                Default order: Student email, then Parent email. If no email is
                available, use WhatsApp.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="text-sm"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyMessage}
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" /> Copy Message
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyParentNumber}
                  className="w-full"
                >
                  <Phone className="w-4 h-4 mr-2" /> Copy Parent Number
                </Button>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
              <p>
                <span className="font-medium">Student:</span> {studentName}
              </p>
              <p>
                <span className="font-medium">Amount:</span> ₹
                {amount.toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Period:</span>{' '}
                {MONTH_NAMES[month - 1]} {year}
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleWhatsAppClick}
              >
                <Phone className="w-4 h-4 mr-2" /> WhatsApp
              </Button>
              <Button
                type="submit"
                disabled={sending || !normalizeEmail(email)}
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" /> Send Email
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
