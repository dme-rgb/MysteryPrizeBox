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
      className="w-full max-w-md p-8 space-y-6 relative"
      style={{
        background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(20, 20, 40, 0.8) 100%)',
        border: '4px solid #F4D03F',
        boxShadow: '0 0 30px rgba(251, 191, 36, 0.4), inset 0 0 20px rgba(34, 197, 94, 0.1)',
        borderRadius: '8px',
      }}
    >
      <div className="text-center space-y-2 mb-6">
        <h2 
          className="text-3xl font-black italic"
          style={{
            color: '#F4D03F',
            textShadow: '0 0 10px rgba(251, 191, 36, 0.6)',
          }}
          data-testid="text-form-title"
        >
          Enter Contest
        </h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#22C55E' }} />
                    <input
                      placeholder="Enter your phone number"
                      className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a]/80 border-2"
                      style={{
                        borderColor: '#22C55E',
                        color: '#F4D03F',
                        boxShadow: '0 0 10px rgba(34, 197, 94, 0.3)',
                      }}
                      data-testid="input-phone"
                      aria-label="Phone Number"
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
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#22C55E' }} />
                    <input
                      placeholder="Enter your vehicle number"
                      className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a]/80 border-2"
                      style={{
                        borderColor: '#22C55E',
                        color: '#F4D03F',
                        boxShadow: '0 0 10px rgba(34, 197, 94, 0.3)',
                      }}
                      data-testid="input-vehicle"
                      aria-label="Vehicle Number"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="relative flex justify-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative px-12 py-4 font-black text-lg rounded-full transition-all"
              style={{
                background: 'radial-gradient(circle at center, #22C55E 0%, #16A34A 100%)',
                color: '#FFFFFF',
                border: '3px solid #F4D03F',
                boxShadow: '0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(251, 191, 36, 0.4)',
                transform: !isSubmitting ? 'scale(1)' : 'scale(0.98)',
              }}
              data-testid="button-submit-form"
            >
              {isSubmitting ? 'Starting...' : 'START RACE'}
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
