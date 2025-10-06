import { communityQuestions, users } from '@/lib/data';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QuestionCard from '@/components/question-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function ProfilePage() {
  const user = users[0];
  const userQuestions = communityQuestions.filter(
    (q) => q.author.id === user.id
  );

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-6xl py-12">
          <div className="flex flex-col items-center md:flex-row md:items-start md:gap-8">
            <div className="flex flex-col items-center">
              <Avatar className="h-32 w-32 border-4 border-primary">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="text-4xl">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h1 className="mt-4 font-headline text-3xl font-bold">{user.name}</h1>
              <p className="mt-1 text-muted-foreground">
                Reputation: {user.reputation}
              </p>
            </div>

            <div className="mt-8 w-full flex-1 md:mt-0">
              <Tabs defaultValue="questions">
                <TabsList>
                  <TabsTrigger value="questions">My Questions</TabsTrigger>
                  <TabsTrigger value="answers">My Answers</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="questions" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Questions you've asked</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {userQuestions.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                          {userQuestions.map((q) => (
                            <QuestionCard key={q.id} question={q} />
                          ))}
                        </div>
                      ) : (
                        <p>You haven't asked any questions yet.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="answers" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Answers you've provided</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>You haven't answered any questions yet.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="settings" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue={user.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={`${user.id}@mubas.ac.mw`} disabled />
                      </div>
                      <Button>Save Changes</Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
