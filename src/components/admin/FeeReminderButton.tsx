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
import { sendEmail, buildFeeReminderEmail } from '@/utils/resendEmail';

interface FeeReminderButtonProps {
  studentName: string;
  parentName: string;
  parentContact: string;
  amount: number;
  month: number;
  year: number;
  recipientEmail?: string;
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

// FormSubmit.co sends TO this verified email (academy inbox)
const FORMSUBMIT_ACADEMY_EMAIL = 'ghataksportsacademy@gmail.com';

export default function FeeReminderButton({
  studentName,
  parentName,
  parentContact,
  amount,
  month,
  year,
  recipientEmail = '',
}: FeeReminderButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState(recipientEmail);
  const [message, setMessage] = useState('');

  const defaultMessage = `Dear ${parentName},

This is a friendly reminder that the fee of ₹${amount.toLocaleString()} for ${studentName}'s training for ${MONTH_NAMES[month - 1]} ${year} is pending.

Please clear the dues at your earliest convenience.

Thank you,
Ghatak Sports Academy`;

  const handleOpenDialog = () => {
    setEmail(recipientEmail);
    setMessage(defaultMessage);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid recipient email address.',
        variant: 'error' as any,
      });
      return;
    }

    setSending(true);

    try {
      // Send email via Resend
      const emailPayload = buildFeeReminderEmail({
        parentName,
        studentName,
        amount,
        month: MONTH_NAMES[month - 1],
        year,
      });
      emailPayload.to = email;

      const emailSent = await sendEmail(emailPayload);

      // Also open WhatsApp as secondary channel
      const whatsappMsg = `Namaste ${parentName} ji,\n\nThis is a reminder that the fee of ₹${amount.toLocaleString()} for ${studentName}'s training for ${MONTH_NAMES[month - 1]} ${year} is pending.\n\nKindly clear the dues at your earliest convenience.\n\n📞 +91 63941 35988\n✉️ ghatakgsai@gmail.com\n\n- Ghatak Sports Academy India`;
      openWhatsAppConversation(parentContact, whatsappMsg);

      toast({
        title: emailSent ? 'Reminder Sent' : 'Partial Success',
        description: emailSent
          ? `Email sent to ${email}. WhatsApp also opened for ${parentName}.`
          : `WhatsApp opened. Email could not be sent.`,
      });
      setDialogOpen(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send email. WhatsApp opened instead.',
        variant: 'error' as any,
      });
      const whatsappMsg = `Namaste ${parentName} ji,\n\nThis is a reminder that the fee of ₹${amount.toLocaleString()} for ${studentName}'s training for ${MONTH_NAMES[month - 1]} ${year} is pending.\n\nKindly clear the dues.\n\n- Ghatak Sports Academy India`;
      openWhatsAppConversation(parentContact, whatsappMsg);
    } finally {
      setSending(false);
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
              pending fees via email + WhatsApp.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Parent/Student Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="parent@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-[10px] text-muted-foreground">
                Email notification is sent to the academy. WhatsApp message
                opens for the parent.
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
              <Button type="submit" disabled={sending}>
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" /> Send Reminder
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
