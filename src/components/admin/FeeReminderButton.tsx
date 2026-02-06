import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Send, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
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
  const formRef = useRef<HTMLFormElement>(null);

  const defaultMessage = `Dear ${parentName},

This is a friendly reminder that the fee of ₹${amount.toLocaleString()} for ${studentName}'s training for ${MONTH_NAMES[month - 1]} ${year} is pending.

Please clear the dues at your earliest convenience.

Thank you,
Ghatak Sports Academy`;

  const handleOpenDialog = () => {
    setMessage(defaultMessage);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'error',
      });
      return;
    }

    setSending(true);

    try {
      // Use formsubmit.co - submit via hidden iframe to avoid redirect
      const formData = new FormData();
      formData.append(
        '_subject',
        `Fee Reminder: ${studentName} - ${MONTH_NAMES[month - 1]} ${year}`
      );
      formData.append('_template', 'box');
      formData.append('Student Name', studentName);
      formData.append('Parent Name', parentName);
      formData.append('Parent Contact', parentContact);
      formData.append('Amount Due', `₹${amount.toLocaleString()}`);
      formData.append('Month/Year', `${MONTH_NAMES[month - 1]} ${year}`);
      formData.append('Message', message);
      formData.append('email', email);
      formData.append('_captcha', 'false');

      const response = await fetch(`https://formsubmit.co/ajax/${email}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      if (response.ok) {
        toast({
          title: 'Reminder Sent',
          description: `Fee reminder email sent to ${email}`,
        });
        setDialogOpen(false);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send email. Please try again.',
        variant: 'error',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenDialog}
        className="gap-1.5"
      >
        <Mail className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Remind</span>
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
              pending fees.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Recipient Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="parent@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
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
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Reminder
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
