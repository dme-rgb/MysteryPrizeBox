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
import fuelRushLogo from '@assets/Gemini_Generated_Image_qj35yaqj35yaqj35-removebg-preview_1764680847950.png';

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
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-4">
        <img 
          src={fuelRushLogo} 
          alt="FUEL RUSH Logo" 
          className="w-48 h-auto mx-auto"
        />
        <h2 className="text-2xl font-bold text-white" data-testid="text-form-title">
          Enter Contest
        </h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400" />
                    <Input
                      placeholder="Phone Number"
                      className="pl-12 py-3 bg-transparent border-2 border-yellow-400 text-white placeholder:text-yellow-200/60 rounded-lg focus:outline-none focus:border-yellow-300"
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
                    <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400" />
                    <Input
                      placeholder="Vehicle Number"
                      className="pl-12 py-3 bg-transparent border-2 border-yellow-400 text-white placeholder:text-yellow-200/60 rounded-lg focus:outline-none focus:border-yellow-300"
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

          <Button
            type="submit"
            disabled={isSubmitting}
            data-testid="button-submit-form"
            className="
              w-full
              py-5
              text-xl
              font-extrabold
              text-black
              rounded-3xl
              relative
              bg-gradient-to-b from-[#ffe28a] to-[#d19c00]
              border border-[#f8e7a0]
              shadow-[0_6px_0_#b68600,0_12px_22px_rgba(0,0,0,0.45)]
              overflow-hidden
              mt-8
            "
          >
            {/* Glossy shine */}
            <span
              className="
                absolute inset-0
                rounded-3xl
                bg-gradient-to-b from-white/50 to-transparent
                pointer-events-none
              "
            />

            <span className="relative z-10">
              {isSubmitting ? "Submitting..." : "ENTER CONTEST"}
            </span>
          </Button>

        </form>
      </Form>
    </div>
  );
}
