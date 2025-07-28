import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Network, Filter, Target, Activity, Brain, Zap } from 'lucide-react';
import { useUnifiedSystem } from '@/hooks/useUnifiedSystem';

interface NetworkNode {
  id: string;
  type: 'metric' | 'hypothesis' | 'insight';
  name: string;
  value: number;
  connections: number;
  x: number;
  y: number;
  category?: string;
}

interface NetworkEdge {
  source: string;
  target: string;
  strength: number;
  type: string;
}

interface NetworkVisualizationProps {
  className?: string;
  onNodeClick?: (nodeId: string, nodeType: string) => void;
}

export const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({
  className = '',
  onNodeClick
}) => {
  const { unifiedMetrics, systemConnections, crossSectionAnalytics } = useUnifiedSystem();
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Создание узлов сети
  const nodes = useMemo((): NetworkNode[] => {
    const allNodes: NetworkNode[] = [];
    
    // Узлы метрик
    unifiedMetrics.forEach((metric, index) => {
      const angle = (index * 2 * Math.PI) / unifiedMetrics.length;
      const radius = 120;
      
      allNodes.push({
        id: metric.id,
        type: 'metric',
        name: metric.name,
        value: metric.currentValue,
        connections: metric.relatedHypotheses.length + metric.relatedInsights.length,
        x: 200 + radius * Math.cos(angle),
        y: 200 + radius * Math.sin(angle),
        category: metric.category
      });
    });

    // Узлы гипотез (размещаем внутри круга)
    systemConnections
      .filter(conn => conn.type === 'metric-hypothesis')
      .forEach((conn, index) => {
        if (!allNodes.find(n => n.id === conn.target)) {
          const angle = (index * 2 * Math.PI) / systemConnections.length;
          const radius = 80;
          
          allNodes.push({
            id: conn.target,
            type: 'hypothesis',
            name: `Эксперимент ${index + 1}`,
            value: conn.strength * 100,
            connections: 1,
            x: 200 + radius * Math.cos(angle),
            y: 200 + radius * Math.sin(angle)
          });
        }
      });

    // Узлы инсайтов (размещаем снаружи)
    systemConnections
      .filter(conn => conn.type === 'metric-rating' || conn.type === 'hypothesis-insight')
      .slice(0, 5) // Ограничиваем количество для читаемости
      .forEach((conn, index) => {
        if (!allNodes.find(n => n.id === conn.target)) {
          const angle = (index * 2 * Math.PI) / 5;
          const radius = 180;
          
          allNodes.push({
            id: conn.target,
            type: 'insight',
            name: `Инсайт ${index + 1}`,
            value: conn.strength * 100,
            connections: 1,
            x: 200 + radius * Math.cos(angle),
            y: 200 + radius * Math.sin(angle)
          });
        }
      });

    return allNodes;
  }, [unifiedMetrics, systemConnections]);

  // Создание связей
  const edges = useMemo((): NetworkEdge[] => {
    return systemConnections
      .filter(conn => {
        const sourceExists = nodes.find(n => n.id === conn.source);
        const targetExists = nodes.find(n => n.id === conn.target);
        return sourceExists && targetExists;
      })
      .map(conn => ({
        source: conn.source,
        target: conn.target,
        strength: conn.strength,
        type: conn.type
      }));
  }, [systemConnections, nodes]);

  // Фильтрация узлов
  const filteredNodes = useMemo(() => {
    if (filterType === 'all') return nodes;
    return nodes.filter(node => node.type === filterType);
  }, [nodes, filterType]);

  // Фильтрация связей
  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    return edges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target));
  }, [edges, filteredNodes]);

  const getNodeColor = (node: NetworkNode) => {
    switch (node.type) {
      case 'metric':
        if (node.value >= 8) return '#22c55e'; // green
        if (node.value >= 6) return '#eab308'; // yellow
        if (node.value >= 4) return '#f97316'; // orange
        return '#ef4444'; // red
      case 'hypothesis':
        return '#8b5cf6'; // purple
      case 'insight':
        return '#06b6d4'; // cyan
      default:
        return '#6b7280'; // gray
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'metric': return <Activity className="h-4 w-4" />;
      case 'hypothesis': return <Target className="h-4 w-4" />;
      case 'insight': return <Brain className="h-4 w-4" />;
      default: return <Network className="h-4 w-4" />;
    }
  };

  const getEdgeColor = (strength: number) => {
    const opacity = strength;
    return `rgba(99, 102, 241, ${opacity})`; // indigo with variable opacity
  };

  const handleNodeClick = (node: NetworkNode) => {
    setSelectedNode(node.id);
    onNodeClick?.(node.id, node.type);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Заголовок и фильтры */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                <Network className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Сеть взаимосвязей</CardTitle>
                <CardDescription>
                  Визуализация связей между метриками, гипотезами и инсайтами
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="metric">Метрики</SelectItem>
                  <SelectItem value="hypothesis">Гипотезы</SelectItem>
                  <SelectItem value="insight">Инсайты</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Визуализация сети */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            {/* SVG контейнер для сети */}
            <svg 
              width="400" 
              height="400" 
              viewBox="0 0 400 400"
              className="w-full max-w-md mx-auto border rounded-lg bg-gradient-to-br from-background to-accent/10"
            >
              {/* Связи */}
              {filteredEdges.map((edge, index) => {
                const sourceNode = filteredNodes.find(n => n.id === edge.source);
                const targetNode = filteredNodes.find(n => n.id === edge.target);
                
                if (!sourceNode || !targetNode) return null;
                
                return (
                  <line
                    key={`edge-${index}`}
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={getEdgeColor(edge.strength)}
                    strokeWidth={Math.max(1, edge.strength * 3)}
                    strokeDasharray={edge.type === 'hypothesis-insight' ? "5,5" : "none"}
                    className="transition-all duration-300"
                  />
                );
              })}
              
              {/* Узлы */}
              {filteredNodes.map((node) => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={Math.max(8, Math.min(20, 8 + node.connections * 2))}
                    fill={getNodeColor(node)}
                    stroke={selectedNode === node.id ? "#000" : "white"}
                    strokeWidth={selectedNode === node.id ? 3 : 2}
                    className="cursor-pointer transition-all duration-300 hover:stroke-primary hover:stroke-3"
                    onClick={() => handleNodeClick(node)}
                  />
                  
                  {/* Подпись узла */}
                  <text
                    x={node.x}
                    y={node.y + 35}
                    textAnchor="middle"
                    className="text-xs fill-foreground font-medium pointer-events-none"
                  >
                    {node.name.length > 12 ? node.name.substring(0, 12) + '...' : node.name}
                  </text>
                </g>
              ))}
            </svg>

            {/* Легенда */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Метрики
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Отлично (8-10)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span>Хорошо (6-7)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span>Средне (4-5)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Плохо (1-3)</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Гипотезы
                </h4>
                <div className="text-sm text-muted-foreground">
                  Активные эксперименты и их связи с метриками
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Инсайты
                </h4>
                <div className="text-sm text-muted-foreground">
                  ИИ-анализ и обнаруженные паттерны
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Детали выбранного узла */}
      {selectedNode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const node = nodes.find(n => n.id === selectedNode);
                return node ? getNodeIcon(node.type) : <Network className="h-5 w-5" />;
              })()}
              Детали узла
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const node = nodes.find(n => n.id === selectedNode);
              if (!node) return <p>Узел не найден</p>;
              
              return (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">{node.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Тип: {node.type === 'metric' ? 'Метрика' : node.type === 'hypothesis' ? 'Гипотеза' : 'Инсайт'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Значение:</span>
                      <div className="font-semibold">{node.value.toFixed(1)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Связей:</span>
                      <div className="font-semibold">{node.connections}</div>
                    </div>
                  </div>
                  
                  {node.category && (
                    <Badge variant="outline">{node.category}</Badge>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onNodeClick?.(node.id, node.type)}
                  >
                    Перейти к деталям
                  </Button>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Статистика сети */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{filteredNodes.length}</div>
          <div className="text-sm text-muted-foreground">Узлов</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{filteredEdges.length}</div>
          <div className="text-sm text-muted-foreground">Связей</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {filteredEdges.length > 0 ? (filteredEdges.reduce((sum, edge) => sum + edge.strength, 0) / filteredEdges.length * 100).toFixed(0) : 0}%
          </div>
          <div className="text-sm text-muted-foreground">Средняя сила связей</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {Math.max(...filteredNodes.map(n => n.connections), 0)}
          </div>
          <div className="text-sm text-muted-foreground">Макс. связей</div>
        </Card>
      </div>
    </div>
  );
};