"use client"
import Image from 'next/image'
import React, { useState } from 'react'
import HomeCard from './HomeCard'
import { useRouter } from 'next/navigation'
import MeetingModal from './MeetingModal'
import { useUser } from '@clerk/nextjs'
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk'

import { useToast } from "@/hooks/use-toast"
import { Textarea } from './ui/textarea'

import ReactDatePicker from 'react-datepicker';
import { Input } from './ui/input'

const MeetingTypeList = () => {
  const router = useRouter();


  const [meetingState, setMeetingState] = useState<'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined>()

  const { user } = useUser();
  const client = useStreamVideoClient();
  const  [values, setValues] = useState({
    dateTime: new Date(),
    description: '',
    link: ''
  })

  const [callDetails , setCallDetails ] = useState<Call>()
  const { toast } = useToast();

  const createMeeting = async () => {
    if (!client || !user) return;

    try {
      if(!values.dateTime) {
        toast({ title: "Por favor selecione uma data e horário", })
        return;
      }

      const id = crypto.randomUUID();
      const call = client.call('default', id);

      if (!call) throw new Error('Failed to create call');
      const startsAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'Instant meeting';

      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description
          }
        }
      })

      setCallDetails(call);

      if(!values.description) {
        router.push(`/meeting/${call.id}`)
      }
      toast({ title: "Consulta criada", })

    } catch (error) {
      console.log(error);
      toast({ title: "Erro ao criar a consulta", })
    }
  }

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <HomeCard 
        img="/icons/add-meeting.svg"
        title="Nova Consulta"
        description="Inicia uma consulta agora"
        handleClick={() => setMeetingState('isInstantMeeting')}
        className="bg-orange-1"
      />
      <HomeCard 
        img="/icons/schedule.svg"
        title="Agendar Consulta"
        description="Planeje sua consulta"
        handleClick={() => setMeetingState('isScheduleMeeting')}
        className="bg-blue-1"
      />
      <HomeCard 
        img="/icons/recordings.svg"
        title="Ver Gravações"
        description="Revise as consultas gravadas"
        handleClick={() => router.push('/recordings')}
        className="bg-purple-1"
      />
      <HomeCard 
        img="/icons/join-meeting.svg"
        title="Participe de uma consulta"
        description="Através de um link de convite"
        handleClick={() => setMeetingState('isJoiningMeeting')}
        className="bg-yellow-1"
      />

      {!callDetails ? (
        <MeetingModal 
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Agendar uma consulta"
          handleClick={createMeeting}
        >
          <div className="flex flex-col gap-2.5">
            <label className="text-base text-normal leading-[22px] text-sky-2">Detalhes da consulta</label>
            <Textarea
              className="border-none bg-dark-3 focus-visible:ring-0 focus-visible-ring-offset-0"
              onChange={(e) => {
                setValues({...values, description: e.target.value})
              }} />
          </div>
          <div className="flex w-full flex-col gap-2.5">
            <label className="text-base text-normal leading-[22px] text-sky-2">Data e horário</label>
            <ReactDatePicker
              selected={values.dateTime} 
              onChange={(date) => setValues({...values, dateTime: date! })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="hora"
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full rounded bg-dark-3 p-2 focus:outline-none"
            />
          </div>
        </MeetingModal>
      ) : (
        <MeetingModal 
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Consulta agendada"
          className="text-center"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({ title: 'Link copiado!' })
          }}
          image="/icons/checked.svg"
          buttonIcon="/icons/copy.svg"
          buttonText="Copiar link da consulta"
        />
      )}

      <MeetingModal 
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Iniciar uma nova consulta"
        className="text-center"
        buttonText="Iniciar Consulta Agora"
        handleClick={createMeeting}
      />

      <MeetingModal 
        isOpen={meetingState === 'isJoiningMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Digite o link aqui"
        className="text-center"
        buttonText="Participar da Consulta"
        handleClick={() => router.push(values.link)}
      >
        <Input 
          placeholder="link da consulta"
          className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
          onChange={(e) => setValues({ ...values, link: e.target.value })}
        />
      </MeetingModal>
    </section>
  )
}

export default MeetingTypeList