import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, CheckCircle, XCircle, Trophy, BarChart2 } from 'lucide-react';
import { format, subDays, parseISO, getDay } from 'date-fns';

export const Insights: React.FC = () => {
  const { tasks } = useApp();

  // Calculations
  const totalTasks = tasks.length;
  const totalStreaks = tasks.reduce((acc, t) => acc + t.streaks, 0);
  const averageStreak = totalTasks > 0 ? Math.round(totalStreaks / totalTasks) : 0;
  
  // Real Completion Rate (Last 30 days)
  const today = new Date();
  const last30Days = Array.from({length: 30}, (_, i) => subDays(today, i));
  
  let completedCount30 = 0;
  let possibleCount30 = 0;

  last30Days.forEach(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      tasks.forEach(task => {
          // Check if task existed on that day
          if (new Date(task.startDate) <= day && new Date(task.endDate) >= day) {
              possibleCount30++;
              if (task.completedDates.includes(dayStr)) {
                  completedCount30++;
              }
          }
      });
  });

  const completionRate = possibleCount30 > 0 ? Math.round((completedCount30 / possibleCount30) * 100) : 0;
  const skippedCount = possibleCount30 - completedCount30;

  // Real Chart Data (Last 7 Days)
  const chartData = useMemo(() => {
      return Array.from({length: 7}, (_, i) => {
          const d = subDays(today, 6 - i); // Reverse to get Mon -> Sun
          const dayStr = format(d, 'yyyy-MM-dd');
          let comp = 0;
          let poss = 0;
          
          tasks.forEach(task => {
              if (new Date(task.startDate) <= d && new Date(task.endDate) >= d) {
                  poss++;
                  if (task.completedDates.includes(dayStr)) comp++;
              }
          });

          return {
              name: format(d, 'EEE'),
              completion: poss > 0 ? Math.round((comp / poss) * 100) : 0
          };
      });
  }, [tasks]);

  // Day of Week Performance
  const dayOfWeekData = useMemo(() => {
      const counts = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      tasks.forEach(task => {
          task.completedDates.forEach(dateStr => {
              const dayIndex = getDay(parseISO(dateStr));
              counts[dayIndex]++;
          });
      });

      return counts.map((count, i) => ({
          day: dayNames[i],
          completed: count
      }));
  }, [tasks]);

  const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-darkcard p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow animate-fade-in">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
        <p className="text-xs text-gray-400 mt-2">{sub}</p>
      </div>
      <div className={`p-3 rounded-xl ${color} text-white shadow-lg`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold">Insights</h2>
        <p className="text-gray-500">Track your daily progress and patterns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Avg. Streak" 
          value={averageStreak} 
          sub="Days per habit"
          icon={Flame} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="Completion Rate" 
          value={`${completionRate}%`} 
          sub="Last 30 days"
          icon={CheckCircle} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Active Habits" 
          value={totalTasks} 
          sub="Currently tracking"
          icon={Trophy} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Missed" 
          value={skippedCount} 
          sub="Days in last 30"
          icon={XCircle} 
          color="bg-red-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-darkcard p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Weekly Performance</h3>
              <span className="text-sm text-gray-500">Last 7 Days</span>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} unit="%" />
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeOpacity={0.1} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} 
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="completion" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorComp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-darkcard p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2"><BarChart2 size={20}/> Most Productive Days</h3>
              <span className="text-sm text-gray-500">All Time</span>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeekData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} 
                  />
                  <Bar dataKey="completed" fill="#a855f7" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
      </div>
    </div>
  );
};
