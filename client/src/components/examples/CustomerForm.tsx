import { useState } from 'react';
import CustomerForm from '../CustomerForm';

export default function CustomerFormExample() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (data: any) => {
    console.log('Form submitted:', data);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      console.log('Submission complete');
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-8">
      <CustomerForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
