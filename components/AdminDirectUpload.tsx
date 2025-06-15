'use client';

import { useState, useRef } from 'react';
import { Upload, Image, Video, FileText, X, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AdminDirectUploadProps {
  onContentAdded: () => void;
}

interface UploadFormData {
  title: string;
  description: string;
  author: string;
  sourceUrl: string;
  category: string;
  tags: string;
}

interface UploadedFile {
  file: File;
  url: string;
  type: 'image' | 'video' | 'gif' | 'pdf';
}

export function AdminDirectUpload({ onContentAdded }: AdminDirectUploadProps) {
  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    description: '',
    author: '',
    sourceUrl: '',
    category: 'design',
    tags: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  console.log('📤 AdminDirectUpload rendered');

  const getFileType = (file: File): 'image' | 'video' | 'gif' | 'pdf' => {
    if (file.type.startsWith('image/gif')) return 'gif';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type === 'application/pdf') return 'pdf';
    return 'image'; // fallback
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'gif': return <Video className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 File selection triggered');
    
    const files = Array.from(e.target.files || []);
    console.log(`📁 Selected ${files.length} files`);
    
    files.forEach(file => {
      try {
        const url = URL.createObjectURL(file);
        const type = getFileType(file);
        
        setUploadedFiles(prev => [...prev, { file, url, type }]);
        
        console.log(`📎 File added: ${file.name} (${type}, ${file.size} bytes)`);
      } catch (error) {
        console.error(`❌ Error processing file ${file.name}:`, error);
        toast({
          title: "Error",
          description: `Erro ao processar arquivo: ${file.name}`,
          variant: "destructive",
        });
      }
    });
    
    // Clear input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const file = prev[index];
      URL.revokeObjectURL(file.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Form submission started');
    
    if (uploadedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Selecione pelo menos um arquivo",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Digite um título",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    toast({
      title: "Upload iniciado",
      description: "Fazendo upload dos arquivos...",
    });

    try {
      console.log(`📤 Admin uploading ${uploadedFiles.length} files`);
      
      // Upload each file to Vercel Blob Storage
      for (let i = 0; i < uploadedFiles.length; i++) {
        const uploadedFile = uploadedFiles[i];
        console.log(`📤 Processing file ${i + 1}/${uploadedFiles.length}: ${uploadedFile.file.name}`);
        
        try {
          // Upload to Vercel Blob via API
          const fileFormData = new FormData();
          fileFormData.append('file', uploadedFile.file);
          
          console.log(`🔄 Starting upload for: ${uploadedFile.file.name}`);
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: fileFormData,
          });
          
          console.log(`📡 Upload response status: ${uploadResponse.status}`);
          
          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('❌ Upload response not OK:', errorText);
            throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
          }
          
          const uploadResult = await uploadResponse.json();
          console.log(`📦 Upload result:`, uploadResult);
          
          if (!uploadResult.success) {
            console.error('❌ Upload API error:', uploadResult);
            throw new Error(uploadResult.error || 'Upload API returned success: false');
          }
          
          console.log(`✅ File uploaded to Blob Storage: ${uploadResult.url}`);
          const mediaUrl = uploadResult.url;
        
          const contentData = {
            title: uploadedFiles.length > 1 ? `${formData.title} (${i + 1}/${uploadedFiles.length})` : formData.title,
            description: formData.description || undefined,
            mediaUrl,
            mediaType: uploadedFile.type,
            author: formData.author || 'Admin',
            sourceUrl: formData.sourceUrl || undefined,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            category: formData.category,
            isPublished: true
          };

          console.log(`💾 Content data prepared:`, contentData);
          // Note: In a real app, this would save to database
          console.log(`✅ Content processed: ${uploadedFile.file.name}`);
          
        } catch (uploadError) {
          console.error(`❌ Error uploading file ${uploadedFile.file.name}:`, uploadError);
          throw new Error(`Falha no upload de "${uploadedFile.file.name}": ${uploadError instanceof Error ? uploadError.message : 'Erro desconhecido'}`);
        }
      }

      toast({
        title: "Upload concluído",
        description: `${uploadedFiles.length} arquivo(s) enviado(s) com sucesso!`,
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        author: '',
        sourceUrl: '',
        category: 'design',
        tags: ''
      });
      
      // Clear files
      uploadedFiles.forEach(file => URL.revokeObjectURL(file.url));
      setUploadedFiles([]);
      
      onContentAdded();
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Upload falhou",
        description: `Falha: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg swiss-title font-light">Upload Direto</h2>
          <p className="text-sm text-swiss-gray mt-1">
            Envie arquivos diretamente com metadados personalizados
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          Admin Tool
        </Badge>
      </div>



      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <Card className="p-6">
          <div className="space-y-4">
            <Label className="text-sm font-medium">Arquivos</Label>
            
            {/* Upload Area */}
            <div 
              className="border-2 border-dashed border-swiss-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-swiss-black transition-colors"
              onClick={() => {
                console.log('📁 Upload area clicked');
                fileInputRef.current?.click();
              }}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-swiss-gray-400" />
              <p className="text-sm font-medium mb-1">Clique para selecionar arquivos</p>
              <p className="text-xs text-swiss-gray">Suporte: JPG, PNG, GIF, MP4, PDF (até 10MB cada)</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.gif,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Selected Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-swiss-gray">
                  Arquivos Selecionados ({uploadedFiles.length})
                </Label>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-swiss-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="font-medium text-sm">{file.file.name}</p>
                        <p className="text-xs text-swiss-gray">
                          {file.type.toUpperCase()} • {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {file.type}
                      </Badge>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Metadata */}
        <Card className="p-6">
          <div className="space-y-4">
            <Label className="text-sm font-medium">Metadados</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="text-sm">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  placeholder="Título do conteúdo"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="author" className="text-sm">Autor</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => handleFormChange('author', e.target.value)}
                  placeholder="Nome do autor/criador"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Descreva o conteúdo..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-sm">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => handleFormChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="photography">Fotografia</SelectItem>
                    <SelectItem value="illustration">Ilustração</SelectItem>
                    <SelectItem value="branding">Branding</SelectItem>
                    <SelectItem value="typography">Tipografia</SelectItem>
                    <SelectItem value="ui-design">UI Design</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="tags" className="text-sm">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleFormChange('tags', e.target.value)}
                  placeholder="tag1, tag2, tag3"
                />
                <p className="text-xs text-swiss-gray mt-1">Separe as tags com vírgulas</p>
              </div>
            </div>

            <div>
              <Label htmlFor="sourceUrl" className="text-sm">Link de Origem</Label>
              <Input
                id="sourceUrl"
                type="url"
                value={formData.sourceUrl}
                onChange={(e) => handleFormChange('sourceUrl', e.target.value)}
                placeholder="https://source.example.com"
              />
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({
                title: '',
                description: '',
                author: '',
                sourceUrl: '',
                category: 'design',
                tags: ''
              });
              uploadedFiles.forEach(file => URL.revokeObjectURL(file.url));
              setUploadedFiles([]);
            }}
            disabled={isUploading}
          >
            Limpar
          </Button>
          <Button
            type="submit"
            disabled={isUploading || uploadedFiles.length === 0 || !formData.title.trim()}
            className="min-w-[120px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Publicar ({uploadedFiles.length})
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}