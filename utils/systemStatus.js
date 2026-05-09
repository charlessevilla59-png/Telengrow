// System Status Checker - Real-time metrics for Admin Dashboard
import os from 'os';

class SystemStatus {
  constructor() {
    this.startTime = Date.now();
    this.errorLog = [];
    this.requestCount = 0;
    this.errorCount = 0;
  }

  // Get server uptime in readable format
  getUptime() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    
    return {
      seconds: uptime,
      formatted: `${days}d ${hours}h ${minutes}m ${seconds}s`,
      days, hours, minutes, seconds
    };
  }

  // Get system memory info
  getMemoryInfo() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = Math.round((usedMemory / totalMemory) * 100);

    return {
      total: Math.round(totalMemory / 1024 / 1024), // MB
      used: Math.round(usedMemory / 1024 / 1024),   // MB
      free: Math.round(freeMemory / 1024 / 1024),   // MB
      usagePercent: memoryUsagePercent,
      status: memoryUsagePercent > 85 ? 'critical' : 
              memoryUsagePercent > 70 ? 'warning' : 
              'healthy'
    };
  }

  // Get CPU info
  getCPUInfo() {
    const cpus = os.cpus();
    const cpuCount = cpus.length;
    
    // Calculate average CPU load (0-1 scale per core)
    const loadAverage = os.loadavg();
    const avgLoad = loadAverage[0] / cpuCount;
    const cpuUsagePercent = Math.round(avgLoad * 100);

    return {
      cores: cpuCount,
      loadAverage: loadAverage.map(l => l.toFixed(2)),
      currentUsagePercent: cpuUsagePercent,
      status: cpuUsagePercent > 85 ? 'critical' : 
              cpuUsagePercent > 70 ? 'warning' : 
              'healthy'
    };
  }

  // Track API metrics
  trackRequest(endpoint, statusCode, duration) {
    this.requestCount++;
    if (statusCode >= 400) {
      this.errorCount++;
    }
    
    // Keep last 100 errors
    if (statusCode >= 400) {
      this.errorLog.push({
        timestamp: new Date(),
        endpoint,
        statusCode,
        duration
      });
      
      if (this.errorLog.length > 100) {
        this.errorLog.shift();
      }
    }
  }

  // Get API health stats
  getAPIHealth() {
    const errorRate = this.requestCount > 0 ? 
      Math.round((this.errorCount / this.requestCount) * 100) : 0;
    
    return {
      totalRequests: this.requestCount,
      totalErrors: this.errorCount,
      errorRatePercent: errorRate,
      status: errorRate > 10 ? 'critical' : 
              errorRate > 5 ? 'warning' : 
              'healthy',
      recentErrors: this.errorLog.slice(-5)
    };
  }

  // Get complete system status
  async getSystemStatus(dbConnection = null) {
    const memory = this.getMemoryInfo();
    const cpu = this.getCPUInfo();
    const api = this.getAPIHealth();
    const uptime = this.getUptime();
    
    // Check database connection
    let dbStatus = 'unknown';
    let dbConnectionTime = 0;
    
    if (dbConnection) {
      try {
        const startTime = Date.now();
        await dbConnection.authenticate();
        dbConnectionTime = Date.now() - startTime;
        dbStatus = 'connected';
      } catch (error) {
        dbStatus = 'error';
        console.error('Database connection error:', error.message);
      }
    }

    // Helper to get color classes based on status
    const getStatusColorClass = (status) => {
      switch(status) {
        case 'healthy': return 'text-emerald-400 bg-emerald-900 border-emerald-700';
        case 'warning': return 'text-yellow-400 bg-yellow-900 border-yellow-700';
        case 'critical': return 'text-red-400 bg-red-900 border-red-700';
        default: return 'text-slate-400 bg-slate-700 border-slate-600';
      }
    };

    return {
      timestamp: new Date(),
      server: {
        status: 'online',
        uptime: uptime.formatted,
        uptimeSeconds: uptime.seconds,
        statusColor: 'text-emerald-400 bg-emerald-900 border-emerald-700'
      },
      database: {
        status: dbStatus,
        connectionTime: dbConnectionTime,
        responseStatus: dbStatus === 'connected' ? '✓ Connected' : 
                        dbStatus === 'error' ? '✗ Error' : 
                        '? Checking',
        statusColor: dbStatus === 'connected' ? 'text-emerald-400 bg-emerald-900 border-emerald-700' :
                     'text-red-400 bg-red-900 border-red-700'
      },
      memory: {
        ...memory,
        statusColor: getStatusColorClass(memory.status)
      },
      cpu: {
        ...cpu,
        statusColor: getStatusColorClass(cpu.status)
      },
      api: api,
      overallHealth: this.calculateOverallHealth(memory, cpu, api, dbStatus)
    };
  }

  // Calculate overall system health
  calculateOverallHealth(memory, cpu, api, dbStatus) {
    const statusScores = {
      'healthy': 3,
      'warning': 2,
      'critical': 1,
      'connected': 3,
      'error': 1,
      'unknown': 2
    };

    const scores = [
      statusScores[memory.status] || 2,
      statusScores[cpu.status] || 2,
      statusScores[api.status] || 2,
      statusScores[dbStatus] || 2
    ];

    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const overallStatus = averageScore >= 2.5 ? 'healthy' : 
                         averageScore >= 1.5 ? 'warning' : 
                         'critical';

    const statusColorMap = {
      'healthy': 'text-emerald-400 bg-emerald-900 border-emerald-700',
      'warning': 'text-yellow-400 bg-yellow-900 border-yellow-700',
      'critical': 'text-red-400 bg-red-900 border-red-700'
    };

    return {
      overall: overallStatus,
      score: Math.round(averageScore * 25), // Convert to 0-100 scale
      statusColor: statusColorMap[overallStatus],
      healthBarColor: overallStatus === 'healthy' ? 'from-emerald-400 to-emerald-500' :
                      overallStatus === 'warning' ? 'from-yellow-400 to-yellow-500' :
                      'from-red-400 to-red-500',
      components: {
        memory: memory.status,
        cpu: cpu.status,
        api: api.status,
        database: dbStatus
      }
    };
  }

  // Reset error log
  clearErrorLog() {
    this.errorLog = [];
  }

  // Get performance metrics
  getPerformanceMetrics() {
    const avgErrorTime = this.errorLog.length > 0 ?
      Math.round(this.errorLog.reduce((sum, e) => sum + e.duration, 0) / this.errorLog.length) :
      0;

    return {
      recentErrors: this.errorLog.slice(-10),
      avgErrorDuration: avgErrorTime,
      errorLogSize: this.errorLog.length,
      totalRequests: this.requestCount,
      totalErrors: this.errorCount
    };
  }
}

// Export singleton instance
export default new SystemStatus();
