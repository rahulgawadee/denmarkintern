'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, ListChecks } from 'lucide-react';
import QuickRoleForm from '@/components/forms/QuickRoleForm';
import FullRoleForm from '@/components/forms/FullRoleForm';

export default function AddRolePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = params?.locale || 'da';
  const user = useSelector((state) => state.auth.user);
  
  // Get mode from query params (quick or full)
  const mode = searchParams.get('mode') || 'quick';
  const [activeTab, setActiveTab] = useState(mode);
  
  // Update active tab when mode changes
  useEffect(() => {
    setActiveTab(mode);
  }, [mode]);

  const copy = locale === 'da' ? {
    title: 'Opret praktikrolle',
    subtitle: 'Vælg hvordan du vil oprette din praktikrolle',
    quickForm: 'Hurtig formular',
    quickFormDesc: '2-trins formular til hurtigt at oprette en rolle',
    fullForm: 'Fuld formular',
    fullFormDesc: 'Detaljeret trin-for-trin guide med alle muligheder',
    back: 'Tilbage til dashboard',
  } : {
    title: 'Create Internship Role',
    subtitle: 'Choose how you want to create your internship role',
    quickForm: 'Quick Form',
    quickFormDesc: '2-step form to quickly create a role',
    fullForm: 'Full Form',
    fullFormDesc: 'Detailed step-by-step guide with all options',
    back: 'Back to dashboard',
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push(`/${locale}/dashboard/company`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {copy.back}
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">{copy.title}</h1>
          <p className="text-zinc-600">{copy.subtitle}</p>
        </div>

        {/* Form Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="quick" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              {copy.quickForm}
            </TabsTrigger>
            <TabsTrigger value="full" className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              {copy.fullForm}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quick">
            <Card>
              <CardHeader>
                <CardTitle>{copy.quickForm}</CardTitle>
                <CardDescription>{copy.quickFormDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <QuickRoleForm locale={locale} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="full">
            <Card>
              <CardHeader>
                <CardTitle>{copy.fullForm}</CardTitle>
                <CardDescription>{copy.fullFormDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <FullRoleForm locale={locale} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
