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
import { Phone, Car, ArrowUp } from 'lucide-react';

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
    <div className="w-full max-w-md relative">
      {/* Energy lightning background effects */}
      <div
        style={{
          position: 'absolute',
          inset: '-40px',
          background: 'radial-gradient(ellipse at center, rgba(180, 255, 100, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
          filter: 'blur(30px)',
          animation: 'energyPulse 3s ease-in-out infinite',
        }}
      />
      
      <div 
        className="w-full relative z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(40, 35, 15, 0.9) 0%, rgba(35, 30, 10, 0.95) 100%)',
          border: '5px solid rgba(218, 165, 32, 0.9)',
          borderRadius: '20px',
          padding: '40px 32px',
          position: 'relative',
          boxShadow: `
            inset 0 0 30px rgba(218, 165, 32, 0.15),
            0 0 50px rgba(180, 255, 100, 0.3),
            0 0 80px rgba(218, 165, 32, 0.15)
          `,
        }}
      >
        {/* Corner decorative elements */}
        {[
          { top: '-8px', left: '-8px' },
          { top: '-8px', right: '-8px' },
          { bottom: '-8px', left: '-8px' },
          { bottom: '-8px', right: '-8px' },
        ].map((pos, i) => (
          <div
            key={`corner-${i}`}
            style={{
              position: 'absolute',
              width: '24px',
              height: '24px',
              backgroundColor: 'rgba(218, 165, 32, 0.95)',
              borderRadius: '50%',
              boxShadow: '0 0 15px rgba(218, 165, 32, 0.7), inset -3px -3px 6px rgba(0,0,0,0.9)',
              ...pos,
            }}
          />
        ))}

        {/* Corner connecting lines */}
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '30px',
            right: '30px',
            height: '3px',
            background: 'linear-gradient(90deg, rgba(218, 165, 32, 0.9) 0%, rgba(180, 255, 100, 0.3) 50%, rgba(218, 165, 32, 0.9) 100%)',
            boxShadow: '0 0 10px rgba(218, 165, 32, 0.6)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '30px',
            right: '30px',
            height: '3px',
            background: 'linear-gradient(90deg, rgba(218, 165, 32, 0.9) 0%, rgba(180, 255, 100, 0.3) 50%, rgba(218, 165, 32, 0.9) 100%)',
            boxShadow: '0 0 10px rgba(218, 165, 32, 0.6)',
          }}
        />

        <div className="space-y-8 pt-4">
          <div className="text-center">
            <h2 
              className="text-4xl font-black" 
              data-testid="text-form-title"
              style={{
                color: 'rgba(218, 165, 32, 0.95)',
                textShadow: `
                  2px 2px 0px rgba(0, 0, 0, 0.9),
                  0 0 15px rgba(218, 165, 32, 0.5)
                `,
              }}
            >
              Enter Contest
            </h2>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative z-20">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Enter your phone number"
                        className="pl-4 contest-input-glow"
                        data-testid="input-phone"
                        aria-label="Phone Number"
                        style={{
                          backgroundColor: 'rgba(15, 10, 0, 0.9)',
                          color: 'rgba(218, 165, 32, 0.95)',
                          border: '2.5px solid rgba(180, 255, 100, 0.6)',
                          borderRadius: '10px',
                          padding: '12px 16px',
                          fontSize: '15px',
                          fontStyle: 'italic',
                          animation: 'inputGlowPulse 2s ease-in-out infinite',
                          boxShadow: '0 0 15px rgba(180, 255, 100, 0.3), inset 0 0 8px rgba(180, 255, 100, 0.1)',
                        }}
                        {...field}
                      />
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
                      <Input
                        placeholder="Enter your vehicle number"
                        className="pl-4 contest-input-glow"
                        data-testid="input-vehicle"
                        aria-label="Vehicle Number"
                        style={{
                          backgroundColor: 'rgba(15, 10, 0, 0.9)',
                          color: 'rgba(218, 165, 32, 0.95)',
                          border: '2.5px solid rgba(180, 255, 100, 0.6)',
                          borderRadius: '10px',
                          padding: '12px 16px',
                          fontSize: '15px',
                          fontStyle: 'italic',
                          animation: 'inputGlowPulse 2s ease-in-out infinite',
                          boxShadow: '0 0 15px rgba(180, 255, 100, 0.3), inset 0 0 8px rgba(180, 255, 100, 0.1)',
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Circular Submit Button */}
              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="button-submit-form"
                  style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(180, 255, 100, 0.95)',
                    color: 'rgba(0, 0, 0, 0.95)',
                    border: '4px solid rgba(218, 165, 32, 0.95)',
                    fontSize: '14px',
                    fontWeight: '900',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: `
                      0 0 30px rgba(180, 255, 100, 0.8),
                      0 0 50px rgba(180, 255, 100, 0.5),
                      inset 0 0 15px rgba(255, 255, 255, 0.3)
                    `,
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.boxShadow = `
                        0 0 40px rgba(180, 255, 100, 1),
                        0 0 70px rgba(180, 255, 100, 0.7),
                        inset 0 0 20px rgba(255, 255, 255, 0.4)
                      `;
                      e.currentTarget.style.transform = 'scale(1.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.boxShadow = `
                        0 0 30px rgba(180, 255, 100, 0.8),
                        0 0 50px rgba(180, 255, 100, 0.5),
                        inset 0 0 15px rgba(255, 255, 255, 0.3)
                      `;
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <span style={{ letterSpacing: '0.05em' }}>
                    {isSubmitting ? 'SENDING...' : 'ENTER'}
                  </span>
                  <span style={{ letterSpacing: '0.05em', fontSize: '12px' }}>
                    {!isSubmitting && 'CONTEST'}
                  </span>
                  {!isSubmitting && <ArrowUp size={16} style={{ marginTop: '2px' }} />}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
