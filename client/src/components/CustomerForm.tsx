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
  vehicleType: z.enum(["bike", "car", "truck"], {
    errorMap: () => ({ message: "Please select a vehicle type" })
  }),
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
      vehicleType: undefined,
    },
  });
  

  return (
    <div className="w-full max-w-sm space-y-2">
      <img 
        src={fuelRushLogo} 
        alt="FUEL RUSH Logo" 
        className="w-200 h-30 mx-auto -mt-4"
      />

      <div className="text-center space-y-4">
        
        <h2 className="text-xl font-bold text-white" data-testid="text-form-title">
          Enter Contest
        </h2>
        <h2 className="text-sm text-white" data-testid="text-form-title">
          Payment will be sent to your UPI account  
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
                      className="
                        pl-12 py-3 w-full
                        bg-transparent
                        text-white
                        placeholder:text-yellow-200/70

                        rounded-xl
                        border-2 border-[#e8c253]

                        shadow-[0_0_12px_rgba(255,215,0,0.4),inset_0_0_8px_rgba(255,215,0,0.25)]

                        relative
                        before:content-['']
                        before:absolute before:left-0 before:right-0 before:top-1/2 before:h-[1px]
                        before:bg-yellow-300/40
                        before:blur-sm

                        focus:outline-none
                        focus:border-yellow-300
                        focus:shadow-[0_0_15px_rgba(255,230,150,0.7),inset_0_0_10px_rgba(255,230,150,0.5)]
                      "

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
                      className="
                        pl-12 py-3 w-full
                        bg-transparent
                        text-white
                        placeholder:text-yellow-200/70

                        rounded-xl
                        border-2 border-[#e8c253]

                        shadow-[0_0_12px_rgba(255,215,0,0.4),inset_0_0_8px_rgba(255,215,0,0.25)]

                        relative
                        before:content-['']
                        before:absolute before:left-0 before:right-0 before:top-1/2 before:h-[1px]
                        before:bg-yellow-300/40
                        before:blur-sm

                        focus:outline-none
                        focus:border-yellow-300
                        focus:shadow-[0_0_15px_rgba(255,230,150,0.7),inset_0_0_10px_rgba(255,230,150,0.5)]
                      "

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

          <FormField
            control={form.control}
            name="vehicleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-sm">Select Vehicle Type</FormLabel>
                <FormControl>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={() => field.onChange('bike')}
                      data-testid="button-vehicle-bike"
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                        field.value === 'bike'
                          ? 'bg-gradient-to-b from-[#ffe28a] to-[#d19c00] text-black border border-[#f8e7a0] shadow-[0_4px_0_#b68600]'
                          : 'bg-transparent border-2 border-[#e8c253] text-white hover:bg-[#e8c253]/20'
                      }`}
                    >
                      🏍️ Bike
                    </Button>
                    <Button
                      type="button"
                      onClick={() => field.onChange('car')}
                      data-testid="button-vehicle-car"
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                        field.value === 'car'
                          ? 'bg-gradient-to-b from-[#ffe28a] to-[#d19c00] text-black border border-[#f8e7a0] shadow-[0_4px_0_#b68600]'
                          : 'bg-transparent border-2 border-[#e8c253] text-white hover:bg-[#e8c253]/20'
                      }`}
                    >
                      🚗 Car
                    </Button>
                    <Button
                      type="button"
                      onClick={() => field.onChange('truck')}
                      data-testid="button-vehicle-truck"
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                        field.value === 'truck'
                          ? 'bg-gradient-to-b from-[#ffe28a] to-[#d19c00] text-black border border-[#f8e7a0] shadow-[0_4px_0_#b68600]'
                          : 'bg-transparent border-2 border-[#e8c253] text-white hover:bg-[#e8c253]/20'
                      }`}
                    >
                      🚛 Truck
                    </Button>
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
              py-3
              text-l
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
                rounded-2xl
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
