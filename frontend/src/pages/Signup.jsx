import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'

import { signupSchema } from '@/lib/validators/auth'
import { saveAuthSession, signup } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const defaultValues = {
  name: '',
  email: '',
  password: '',
}

function SignupPage() {
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues,
  })

  const handleSubmit = async (values) => {
    setServerError('')
    setSuccessMessage('')

    try {
      const session = await signup(values)
      saveAuthSession(session)
      setSuccessMessage('Account created! You are now signed in.')
    } catch (error) {
      setServerError(
        error?.message ?? 'Unable to create account. Please try again.',
      )
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Start generating personalized recipes in a few steps.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {serverError ? (
            <Alert variant="destructive">
              <AlertTitle>Signup failed</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          ) : null}
          {successMessage ? (
            <Alert>
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          ) : null}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
              noValidate
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Your name"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Create a password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Creating account...' : 'Sign up'}
              </Button>
            </form>
          </Form>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

export default SignupPage
