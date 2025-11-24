import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Phone, Car } from 'lucide-react';

const formSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  vehicleNumber: z.string().min(2, "Vehicle number is required"),
});

type FormData = z.infer<typeof formSchema>;

interface CustomerFormProps {
  onSubmit: (data: FormData) => void;
  isSubmitting: boolean;
}

export default function CustomerForm({ onSubmit, isSubmitting }: CustomerFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: '',
      vehicleNumber: '',
    },
  });

  return (
    <div 
      className="w-full max-w-md"
      style={{
        background: 'rgba(30, 25, 10, 0.7)',
        border: '6px solid rgba(218, 165, 32, 0.8)',
        borderRadius: '12px',
        padding: '32px',
        position: 'relative',
        boxShadow: 'inset 0 0 20px rgba(218, 165, 32, 0.1), 0 0 40px rgba(218, 165, 32, 0.2)',
        clipPath: 'polygon(15px 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0% 100%, 0% 15px)',
      }}
    >
      {/* Corner bolts/rivets */}
      {[
        { top: '-3px', left: '20px' },
        { top: '-3px', right: '20px' },
        { bottom: '-3px', left: '20px' },
        { bottom: '-3px', right: '20px' },
      ].map((pos, i) => (
        <div
          key={`bolt-${i}`}
          style={{
            position: 'absolute',
            width: '12px',
            height: '12px',
            backgroundColor: 'rgba(218, 165, 32, 0.9)',
            borderRadius: '50%',
            boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(218, 165, 32, 0.5)',
            ...pos,
          }}
        />
      ))}

      {/* Side bolts */}
      {[
        { top: '30px', left: '-3px' },
        { top: '30px', right: '-3px' },
        { bottom: '30px', left: '-3px' },
        { bottom: '30px', right: '-3px' },
      ].map((pos, i) => (
        <div
          key={`side-bolt-${i}`}
          style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            backgroundColor: 'rgba(218, 165, 32, 0.8)',
            borderRadius: '50%',
            boxShadow: 'inset -1px -1px 3px rgba(0,0,0,0.8), 0 0 6px rgba(218, 165, 32, 0.4)',
            ...pos,
          }}
        />
      ))}

      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 
            className="text-4xl font-black tracking-wider" 
            data-testid="text-form-title"
            style={{
              color: 'rgba(218, 165, 32, 0.95)',
              textShadow: `
                2px 2px 0px rgba(0, 0, 0, 0.8),
                3px 3px 8px rgba(218, 165, 32, 0.4),
                0 0 10px rgba(218, 165, 32, 0.2)
              `,
              fontStyle: 'italic',
              letterSpacing: '0.05em',
            }}
          >
            ENTER CONTEST
          </h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Phone 
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                        style={{ color: 'rgba(180, 255, 100, 0.7)' }}
                      />
                      <Input
                        placeholder="Enter your phone number"
                        className="pl-10 contest-input"
                        data-testid="input-phone"
                        aria-label="Phone Number"
                        style={{
                          backgroundColor: 'rgba(20, 15, 5, 0.8)',
                          color: 'rgba(218, 165, 32, 0.9)',
                          border: '2px solid rgba(180, 255, 100, 0.4)',
                          animation: 'pulsingGreenGlow 2s ease-in-out infinite',
                          fontWeight: '500',
                        }}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vehicleNumber"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Car 
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                        style={{ color: 'rgba(180, 255, 100, 0.7)' }}
                      />
                      <Input
                        placeholder="Enter your vehicle number"
                        className="pl-10 contest-input"
                        data-testid="input-vehicle"
                        aria-label="Vehicle Number"
                        style={{
                          backgroundColor: 'rgba(20, 15, 5, 0.8)',
                          color: 'rgba(218, 165, 32, 0.9)',
                          border: '2px solid rgba(180, 255, 100, 0.4)',
                          animation: 'pulsingGreenGlow 2s ease-in-out infinite',
                          fontWeight: '500',
                        }}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full py-6 text-lg font-bold"
              disabled={isSubmitting}
              data-testid="button-submit-form"
              style={{
                backgroundColor: 'rgba(218, 165, 32, 0.85)',
                color: 'rgba(0, 0, 0, 0.9)',
                border: '2px solid rgba(218, 165, 32, 0.95)',
                fontWeight: '700',
              }}
            >
              {isSubmitting ? 'Submitting...' : 'ENTER CONTEST'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
