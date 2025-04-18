'use client'
import React from 'react'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { createMedia, saveActivityLogsNotification } from '@/lib/queries'
import FileUpload from '../global/file-upload'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useToast } from '@/hooks/use-toast'
import Loading from '../global/loading'

type Props = {
  subaccountId: string
  setClose: () => void
}

const formSchema = z.object({
  link: z.string().min(1, { message: 'Media File is required' }),
  name: z.string().min(1, { message: 'Name is required' }),
})

const UploadMediaForm = ({ subaccountId, setClose }: Props) => {
  const { toast } = useToast()
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: {
      link: '',
      name: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await createMedia(subaccountId, values)
      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Uploaded a media file | ${response.name}`,
        subaccountId
      })
      toast({ title: "success", description: "Uploaded media" })
      setClose()
      router.refresh()
    } catch (error) {
      console.log(error)
      toast({
        variant: "destructive",
        title: "Failed",
        description: "Could not uploaded media"
      })
      setClose()
    }

  }

  return <Card className='w-full'>
    <CardHeader>
      <CardTitle>Media Information</CardTitle>
      <CardDescription>Please enter the details for your file</CardDescription>
    </CardHeader>
    <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>File Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your agency name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Media File</FormLabel>
                <FormControl>
                  <FileUpload
                    apiEndpoint="subaccountLogo"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="mt-4"
          >
            {form.formState.isSubmitting ? <Loading /> : 'Upload Media'}
          </Button>
        </form>
      </Form>
    </CardContent>
  </Card>







}

export default UploadMediaForm


