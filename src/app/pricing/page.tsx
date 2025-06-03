'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckIcon, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const pricingPlans = [
  {
    title: 'Free Forever',
    price: '0',
    frequency: '/mo',
    features: [
      'Basic email sending',
      'Up to 1,000 emails/month',
      'Basic analytics',
      'Community support',
    ],
    buttonText: 'Get Started',
    buttonVariant: 'outline',
  },
  {
    title: 'Standard',
    price: '599',
    frequency: '/mo',
    features: [
      'All Free features',
      'Up to 100,000 emails/month',
      'Advanced analytics',
      'Email templates',
      'Priority support',
    ],
    buttonText: 'Choose Standard',
    buttonVariant: 'default',
  },
  {
    title: 'Pro',
    price: '999',
    frequency: '/mo',
    features: [
      'All Standard features',
      'Up to 500,000 emails/month',
      'A/B testing',
      'Marketing automation',
      'Dedicated support',
      'Custom reporting',
    ],
    buttonText: 'Choose Pro',
    buttonVariant: 'default',
  },
  {
    title: 'Enterprise',
    price: '1599',
    frequency: '/mo',
    features: [
      'All Pro features',
      'Unlimited emails',
      'Account manager',
      'SLA',
      'Custom integrations',
      'On-premise option',
    ],
    buttonText: 'Contact Us',
    buttonVariant: 'default',
  },
];

const PricingPage = () => {
  return (
    <div className="relative flex flex-col items-center p-6 md:p-10 lg:p-16 bg-app-background min-h-screen">
      {/* Go to Dashboard Button */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 lg:top-16 lg:left-16">
        <Link href="/" passHref>
          <div className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 transition-colors duration-200">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </div>
        </Link>
      </div>

      <h1 className="text-4xl font-bold text-gray-800 mb-8 mt-12 md:mt-0">Pricing Plans</h1>
      <p className="text-lg text-gray-600 mb-12 text-center max-w-2xl">
        Choose the plan that best fits your email marketing needs.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl">
        {pricingPlans.map((plan, index) => (
          <Card key={index} className="flex flex-col p-6 rounded-xl shadow-lg">
            <CardHeader className="pb-4 text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">{plan.title}</CardTitle>
              <div className="text-4xl font-extrabold text-gray-900 mt-2">
                ₹{plan.price}
                {plan.frequency && <span className="text-lg font-medium text-gray-600">{plan.frequency}</span>}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-gray-700 text-sm">
                    <CheckIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))
                }
              </ul>
            </CardContent>
            <CardFooter className="pt-6">
              <Button className={`w-full rounded-lg py-2 ${
                plan.buttonVariant === 'outline' ? 'bg-booger-buster hover:bg-booger-buster/90 text-rich-green' : 'bg-rich-green hover:bg-rich-green/90 text-white'
              }`}>
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))
        }
      </div>
    </div>
  );
};

export default PricingPage; 