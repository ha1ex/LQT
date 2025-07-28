import React, { useState } from 'react';
import { RatingAnalytics } from '@/components/rating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWeeklyRatings } from '@/hooks/useWeeklyRatings';
import { BarChart3, TrendingUp, Target } from 'lucide-react';

const Analytics = () => {
  const [timeFilter, setTimeFilter] = useState('month');
  const [analyticsTab, setAnalyticsTab] = useState('overview');
  
  const { ratings: weeklyRatings, getAnalytics } = useWeeklyRatings();
  const analytics = getAnalytics();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Аналитика</h1>
          <p className="text-muted-foreground mt-1">
            Анализ трендов и корреляций в ваших оценках
          </p>
        </div>
        
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Выберите период" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Последняя неделя</SelectItem>
            <SelectItem value="month">Последний месяц</SelectItem>
            <SelectItem value="quarter">Последний квартал</SelectItem>
            <SelectItem value="year">Последний год</SelectItem>
            <SelectItem value="all">Все время</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={analyticsTab} onValueChange={setAnalyticsTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Обзор
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Тренды
          </TabsTrigger>
          <TabsTrigger value="correlations" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Корреляции
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <RatingAnalytics 
            analytics={analytics}
            allMetrics={[]}
          />
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <RatingAnalytics 
            analytics={analytics}
            allMetrics={[]}
          />
        </TabsContent>
        
        <TabsContent value="correlations" className="space-y-4">
          <RatingAnalytics 
            analytics={analytics}
            allMetrics={[]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;