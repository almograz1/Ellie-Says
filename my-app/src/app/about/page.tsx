// app/about/page.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'

interface TeamMember { name: string; role: string; bio: string }
const initialTeam: TeamMember[] = [
  { name: 'Sarah Johnson', role: 'Founder & CEO', bio: 'Language enthusiast with a passion for making education accessible to all.' },
  { name: 'David Chen', role: 'Head of Education', bio: 'Linguistics PhD with 15 years of experience in language acquisition research.' },
  { name: 'Maria Rodriguez', role: 'Lead Developer', bio: 'Software engineer specialized in creating intuitive educational experiences.' }
]

export default function AboutPage() {
  const [team] = useState(initialTeam)

  return (
      <div className="min-h-screen bg-gradient-to-r from-indigo-50 via-blue-50 to-green-50">
        <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
          <section className="bg-white rounded-2xl shadow-xl overflow-hidden md:flex">
            <div className="md:w-1/2 relative h-64 md:h-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-90" />
              <div className="relative h-full flex items-center justify-center p-8 text-white">
                <div>
                  <h1 className="text-4xl font-bold mb-4">Our Mission</h1>
                  <p className="text-lg opacity-90">Making language learning accessible, engaging, and effective for everyone around the world.</p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 p-8 space-y-6">
              <h2 className="text-3xl font-bold text-gray-800">About LinguaLoop</h2>
              <p className="text-gray-600">LinguaLoop was founded in 2023 with a simple yet powerful idea: language learning should be fun, effective, and accessible to everyone worldwide.</p>
            </div>
          </section>
          <section>
            <h2 className="text-3xl font-bold text-gray-800">Meet the Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {team.map(member => (
                  <div key={member.name} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg">
                    <Image src={`/team/${member.name.replace(/ /g, '-').toLowerCase()}.jpg`} alt={member.name} width={80} height={80} className="rounded-full mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-1 text-center">{member.name}</h3>
                    <p className="text-indigo-600 text-sm mb-2 text-center">{member.role}</p>
                    <p className="text-gray-600 text-center">{member.bio}</p>
                  </div>
              ))}
            </div>
          </section>
        </main>
      </div>
  )
}
