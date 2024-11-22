"use client";
import React from "react";
import { ScrollArea, Avatar, UnstyledButton } from "@mantine/core";
import { BsPerson, BsCalendar, BsEnvelope } from "react-icons/bs";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface WeeklyNewUserWatchProps {
  users: User[];
}

const WeeklyNewUserWatch: React.FC<WeeklyNewUserWatchProps> = ({ users }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="rounded-lg bg-white p-2 shadow transition-shadow hover:shadow-lg lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
          <BsPerson className="h-5 w-5 text-blue-600" />
          Yeni Kullanıcılar
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-sm font-medium text-blue-600">
            {users.length}
          </span>
        </h3>
      </div>

      <ScrollArea className="h-[calc(100vh-400px)]" type="hover">
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="group flex items-start gap-4 rounded-lg border border-gray-100 p-4 transition-all hover:border-gray-200 hover:bg-gray-50"
            >
              <Avatar
                color="blue"
                radius="xl"
                size="md"
                className="border border-gray-200"
              >
                {getInitials(user.name)}
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{user.name}</h4>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                      <BsEnvelope className="h-4 w-4" />
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <BsCalendar className="h-4 w-4" />
                    {formatDate(user.createdAt.toISOString())}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="flex h-32 items-center justify-center text-gray-500">
            Henüz yeni kullanıcı bulunmuyor.
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default WeeklyNewUserWatch;
