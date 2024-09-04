import { observer } from "mobx-react-lite";
//import React, { useEffect } from "react";

//import { useParams } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "./calendarStyles/styles.scss";
import { useAppContext } from "../../../../shared/functions/Context";

export const CalendarView = observer(() => {
  const { api, store } = useAppContext();
  
//   useEffect(() => {
//     const getMeetings = async () => {
//       if (instruments) {
//         await api.instruments.getAll();
//       }
//     };
//     getMeetings();
//   }, [api.communication.meeting, folderId, me?.property]);

  const instruments = store.instruments;
   

  const localizer = momentLocalizer(moment);

//   const onViewDetails = (meeting: IMeeting) => {
//     store.communication.meeting.select(meeting);
//     showModalFromId(DIALOG_NAMES.COMMUNICATION.EDIT_MEETING_DIALOG);
//   };

//   const handleSelectEvent = (event: any, e: any) => {
//     const selectedMeeting: IMeeting = {
//       title: event.title,
//       startDateAndTime: event.start.toISOString().slice(0, 16),
//       endDateAndTime: event.end.toISOString().slice(0, 16),
//       id: event.id,
//       dateCreate: event.dateCreate,
//       folderId: event.folderId,
//       attachments: event.attachments,
//       description: event.description,
//       location: event.location,
//       organizer: event.organizer,
//       status: event.status,
//       ownerParticipants: event.ownerParticipants,
//       externalParticipants: event.externalParticipants,
//       meetingNote: event.meetingNote,
//       priority: event.priority,
//       meetingLink: event.meetingLink,
//     };
//     onViewDetails(selectedMeeting);
//   };

  return (
    <>
      <div>
        <Calendar
          localizer={localizer}
          //events={meetings}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
        //   eventPropGetter={(event, start, end, isSelected) => ({
        //     style: event.style,
        //   })}
         // onSelectEvent={handleSelectEvent}
        />
      </div>
    </>
  );
});
