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
    <div className="relative w-full max-w-md">
      {/* Angular Container with Skew Effect */}
      <div 
        className="relative p-12 pt-16 pb-24"
        style={{
          background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(15, 15, 30, 0.9) 100%)',
          clipPath: 'polygon(0% 5%, 100% 0%, 100% 90%, 95% 100%, 0% 100%)',
          border: '4px solid #F4D03F',
          boxShadow: `
            0 0 40px rgba(251, 191, 36, 0.5),
            inset 0 0 30px rgba(34, 197, 94, 0.15),
            0 20px 40px rgba(0, 0, 0, 0.6)
          `,
        }}
      >
        {/* Glowing edge effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, transparent 50%, rgba(34, 197, 94, 0.1) 100%)',
            clipPath: 'polygon(0% 5%, 100% 0%, 100% 90%, 95% 100%, 0% 100%)',
          }}
        />

        {/* Title */}
        <div className="text-center space-y-2 mb-8 relative z-10">
          <h2 
            className="text-4xl font-black italic"
            style={{
              color: '#F4D03F',
              textShadow: '0 0 15px rgba(251, 191, 36, 0.8), 0 0 25px rgba(34, 197, 94, 0.4)',
            }}
            data-testid="text-form-title"
          >
            Enter Contest
          </h2>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 relative z-10">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#22C55E' }} />
                      <input
                        placeholder="Enter your phone number"
                        className="w-full pl-12 pr-4 py-3 bg-[#0a0a0a]/60 border-2 rounded-full focus:outline-none transition-all"
                        style={{
                          borderColor: '#22C55E',
                          color: '#F4D03F',
                          boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)',
                          fontSize: '15px',
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
                      <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#22C55E' }} />
                      <input
                        placeholder="Enter your vehicle number"
                        className="w-full pl-12 pr-4 py-3 bg-[#0a0a0a]/60 border-2 rounded-full focus:outline-none transition-all"
                        style={{
                          borderColor: '#22C55E',
                          color: '#F4D03F',
                          boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)',
                          fontSize: '15px',
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
          </form>
        </Form>
      </div>

      {/* Circular Button - Positioned at bottom */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 z-20">
        <button
          type="button"
          onClick={() => form.handleSubmit(onSubmit)()}
          disabled={isSubmitting}
          className="relative"
          style={{
            width: '140px',
            height: '140px',
          }}
          data-testid="button-submit-form"
        >
          {/* Outer golden ring */}
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center"
            style={{
              background: 'conic-gradient(from 0deg, #F4D03F, #FFA500, #F4D03F)',
              padding: '6px',
              boxShadow: '0 0 30px rgba(251, 191, 36, 0.8), 0 0 60px rgba(255, 165, 0, 0.4)',
            }}
          >
            {/* Inner green button */}
            <div
              className="absolute inset-1.5 rounded-full flex items-center justify-center font-black text-white italic text-center leading-tight"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #4ADE80 0%, #22C55E 50%, #16A34A 100%)',
                boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.2), 0 0 20px rgba(34, 197, 94, 0.8)',
                fontSize: '14px',
                color: '#FFFFFF',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              }}
            >
              START<br />RACE
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
