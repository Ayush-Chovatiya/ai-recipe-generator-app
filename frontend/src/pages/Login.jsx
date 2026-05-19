import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'

import { loginSchema } from '@/lib/validators/auth'
import { login, saveAuthSession } from '@/lib/api'
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
  email: '',
  password: '',
}

function LoginPage() {
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues,
  })

  const handleSubmit = async (values) => {
    setServerError('')
    setSuccessMessage('')

    try {
      const session = await login(values)
      saveAuthSession(session)
      setSuccessMessage('Welcome back! You are now logged in.')
    } catch (error) {
      setServerError(error?.message ?? 'Unable to log in. Please try again.')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Log in to continue generating recipes in seconds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {serverError ? (
            <Alert variant="destructive">
              <AlertTitle>Login failed</AlertTitle>
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
                        placeholder="Enter your password"
                        autoComplete="current-password"
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
                {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </Form>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="font-medium text-primary hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

export default LoginPage
