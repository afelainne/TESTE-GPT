export const generateInitialContent = () => {
  const sampleContent = [
    {
      id: 'initial_1',
      title: 'Minimal Design Inspiration',
      imageUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&q=80',
      contentType: 'image' as const,
      userId: 'sample_user_1',
      uploadType: 'url' as const,
      originalUrl: 'https://unsplash.com/photos/minimal-design',
      folders: [],
      tags: ['minimal', 'design', 'clean'],
      createdAt: new Date('2024-01-15')
    },
    {
      id: 'initial_2',
      title: 'Typography Showcase',
      imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0bd31a82edd?w=600&q=80',
      contentType: 'image' as const,
      userId: 'sample_user_2',
      uploadType: 'url' as const,
      originalUrl: 'https://unsplash.com/photos/typography',
      folders: [],
      tags: ['typography', 'fonts', 'text'],
      createdAt: new Date('2024-01-14')
    },
    {
      id: 'initial_3',
      title: 'Black and White Photography',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
      contentType: 'image' as const,
      userId: 'sample_user_3',
      uploadType: 'url' as const,
      originalUrl: 'https://unsplash.com/photos/bw-photo',
      folders: [],
      tags: ['photography', 'monochrome', 'artistic'],
      createdAt: new Date('2024-01-13')
    },
    {
      id: 'initial_4',
      title: 'Geometric Patterns',
      imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=600&q=80',
      contentType: 'image' as const,
      userId: 'sample_user_4',
      uploadType: 'url' as const,
      originalUrl: 'https://unsplash.com/photos/geometric',
      folders: [],
      tags: ['geometric', 'patterns', 'abstract'],
      createdAt: new Date('2024-01-12')
    },
    {
      id: 'initial_5',
      title: 'Modern Architecture',
      imageUrl: 'https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?w=600&q=80',
      contentType: 'image' as const,
      userId: 'sample_user_5',
      uploadType: 'url' as const,
      originalUrl: 'https://unsplash.com/photos/architecture',
      folders: [],
      tags: ['architecture', 'modern', 'building'],
      createdAt: new Date('2024-01-11')
    },
    {
      id: 'initial_6',
      title: 'UI Design Elements',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
      contentType: 'image' as const,
      userId: 'sample_user_6',
      uploadType: 'url' as const,
      originalUrl: 'https://unsplash.com/photos/ui-design',
      folders: [],
      tags: ['ui', 'interface', 'design'],
      createdAt: new Date('2024-01-10')
    },
    {
      id: 'initial_7',
      title: 'Minimalist Workspace',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
      contentType: 'image' as const,
      userId: 'sample_user_7',
      uploadType: 'url' as const,
      originalUrl: 'https://unsplash.com/photos/workspace',
      folders: [],
      tags: ['workspace', 'minimal', 'office'],
      createdAt: new Date('2024-01-09')
    },
    {
      id: 'initial_8',
      title: 'Brand Identity Design',
      imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&q=80',
      contentType: 'image' as const,
      userId: 'sample_user_8',
      uploadType: 'url' as const,
      originalUrl: 'https://unsplash.com/photos/branding',
      folders: [],
      tags: ['branding', 'identity', 'logo'],
      createdAt: new Date('2024-01-08')
    }
  ];

  return sampleContent;
};