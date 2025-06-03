'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface GenerateEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailGenerated: (email: { subject: string; content: string; metadata: any }) => void;
}

const GenerateEmailModal: React.FC<GenerateEmailModalProps> = ({
  isOpen,
  onClose,
  onEmailGenerated,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    emailType: '',
    targetAudience: '',
    tone: '',
    keyPoints: '',
    callToAction: '',
    additionalNotes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate email');
      }

      const data = await response.json();
      onEmailGenerated(data);
      toast({
        title: "Success!",
        description: "Email content has been generated.",
      });
      onClose();
    } catch (error) {
      console.error('Error generating email:', error);
      toast({
        title: "Error",
        description: "Failed to generate email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[425px] md:max-w-[520px] lg:max-w-[600px] xl:max-w-[700px] p-2 sm:p-4 md:p-6 rounded-lg max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle>Generate Email Content</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailType">Email Type</Label>
            <Input
              id="emailType"
              name="emailType"
              value={formData.emailType}
              onChange={handleInputChange}
              placeholder="e.g., Newsletter, Promotion, Welcome"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Input
              id="targetAudience"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleInputChange}
              placeholder="e.g., New Customers, Existing Users"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Input
              id="tone"
              name="tone"
              value={formData.tone}
              onChange={handleInputChange}
              placeholder="e.g., Professional, Friendly, Urgent"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyPoints">Key Points</Label>
            <Textarea
              id="keyPoints"
              name="keyPoints"
              value={formData.keyPoints}
              onChange={handleInputChange}
              placeholder="Enter the main points to include in the email"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="callToAction">Call to Action</Label>
            <Input
              id="callToAction"
              name="callToAction"
              value={formData.callToAction}
              onChange={handleInputChange}
              placeholder="e.g., Sign up now, Learn more"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleInputChange}
              placeholder="Any additional instructions or requirements"
              rows={2}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-rich-green hover:bg-rich-green/90 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateEmailModal; 