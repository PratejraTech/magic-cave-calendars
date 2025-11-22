import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Search, Plus, Edit, Trash2, Eye, BarChart3 } from 'lucide-react';

interface Template {
  template_id: string;
  name: string;
  description: string;
  status: 'active' | 'retired' | 'draft';
  product_type: 'calendar' | 'storybook' | 'interactive_game';
  preview_image?: string;
  created_at: string;
  updated_at: string;
  usage_count?: number;
  engagement_score?: number;
}

interface TemplateListProps {
  onCreateTemplate: () => void;
  onEditTemplate: (templateId: string) => void;
  onViewAnalytics: (templateId: string) => void;
  onRetireTemplate: (templateId: string) => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  onCreateTemplate,
  onEditTemplate,
  onViewAnalytics,
  onRetireTemplate,
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [productTypeFilter, setProductTypeFilter] = useState<string>('all');

  // Mock data for now - in real implementation, this would fetch from API
  useEffect(() => {
    const mockTemplates: Template[] = [
      {
        template_id: 'template-1',
        name: 'Magical Christmas Adventure',
        description: 'A festive calendar with personalized Christmas stories and activities',
        status: 'active',
        product_type: 'calendar',
        usage_count: 1250,
        engagement_score: 4.2,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T14:30:00Z',
      },
      {
        template_id: 'template-2',
        name: 'Bedtime Story Collection',
        description: 'Interactive storybook with custom characters and personalized endings',
        status: 'active',
        product_type: 'storybook',
        usage_count: 890,
        engagement_score: 4.5,
        created_at: '2024-01-10T09:15:00Z',
        updated_at: '2024-01-18T16:45:00Z',
      },
      {
        template_id: 'template-3',
        name: 'Adventure Game Quest',
        description: 'Interactive game with custom challenges and personalized rewards',
        status: 'draft',
        product_type: 'interactive_game',
        usage_count: 0,
        engagement_score: 0,
        created_at: '2024-01-22T11:20:00Z',
        updated_at: '2024-01-22T11:20:00Z',
      },
    ];

    setTimeout(() => {
      setTemplates(mockTemplates);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    const matchesProductType = productTypeFilter === 'all' || template.product_type === productTypeFilter;

    return matchesSearch && matchesStatus && matchesProductType;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'retired': return 'secondary';
      case 'draft': return 'outline';
      default: return 'default';
    }
  };

  const getProductTypeLabel = (productType: string) => {
    switch (productType) {
      case 'calendar': return 'Calendar';
      case 'storybook': return 'Storybook';
      case 'interactive_game': return 'Game';
      default: return productType;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Template Management</h2>
          <p className="text-gray-600">Manage and monitor your product templates</p>
        </div>
        <Button onClick={onCreateTemplate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
          </SelectContent>
        </Select>

        <Select value={productTypeFilter} onValueChange={setProductTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Product Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="calendar">Calendar</SelectItem>
            <SelectItem value="storybook">Storybook</SelectItem>
            <SelectItem value="interactive_game">Game</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Template Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.template_id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={getStatusBadgeVariant(template.status)}>
                      {template.status}
                    </Badge>
                    <Badge variant="outline">
                      {getProductTypeLabel(template.product_type)}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewAnalytics(template.template_id)}
                    title="View Analytics"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditTemplate(template.template_id)}
                    title="Edit Template"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {template.status === 'active' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRetireTemplate(template.template_id)}
                      title="Retire Template"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {template.description}
              </p>

              <div className="space-y-2">
                {template.usage_count !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Usage:</span>
                    <span className="font-medium">{template.usage_count.toLocaleString()}</span>
                  </div>
                )}

                {template.engagement_score !== undefined && template.engagement_score > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Engagement:</span>
                    <span className="font-medium">{template.engagement_score.toFixed(1)}/5</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Updated:</span>
                  <span className="font-medium">
                    {new Date(template.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Eye className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' || productTypeFilter !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by creating your first template.'}
          </p>
          <Button onClick={onCreateTemplate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      )}
    </div>
  );
};