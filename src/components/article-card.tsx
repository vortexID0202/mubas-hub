import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  Landmark,
  LucideProps,
  Wifi,
} from 'lucide-react';
import type { KnowledgeBaseArticle } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ArticleCardProps {
  article: KnowledgeBaseArticle;
}

const iconMap: { [key: string]: React.FC<LucideProps> } = {
  Wifi: Wifi,
  Landmark: Landmark,
  BookOpen: BookOpen,
};

export default function ArticleCard({ article }: ArticleCardProps) {
  const Icon = iconMap[article.icon] || BookOpen;

  return (
    <Link href={`/kb/${article.id}`} className="block">
      <Card className="flex h-full flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-l-4 border-accent">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Icon className="h-6 w-6 text-accent" />
              </div>
              <Badge variant="outline" className="border-accent text-accent">
                {article.category}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <CardTitle className="text-lg font-semibold leading-snug">
            {article.title}
          </CardTitle>
          <CardDescription className="mt-2 line-clamp-3 text-sm">
            {article.body}
          </CardDescription>
        </CardContent>
        <CardFooter>
          <div className="flex items-center text-xs text-green-600">
            <CheckCircle2 className="mr-1 h-4 w-4" />
            <span>Verified by MUBAS</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
