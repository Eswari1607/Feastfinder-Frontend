import { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Grid,
  Slider,
  Chip,
} from "@mui/material";
import { useSnackbar } from "notistack";
import axios from "axios";
import { Group } from "@mui/icons-material";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

export default function EditBooking({ open, handleClose, booking }) {
  const { enqueueSnackbar } = useSnackbar();

  // Initialize `selectedDate` to null or booking date (converted to dayjs format)
  const [selectedDate, setSelectedDate] = useState(
    booking?.selectedDate ? dayjs(booking.selectedDate) : null
  );
  const [selectedTime, setSelectedTime] = useState(booking?.selectedTime || "");
  const [selectedSeats, setSelectedSeats] = useState(
    booking?.selectedSeats || 1
  );

  const timeSlots = [
    "10 AM - 11 AM",
    "11 AM - 12 PM",
    "12 PM - 1 PM",
    "1 PM - 2 PM",
    "7 PM - 8 PM",
    "8 PM - 9 PM",
    "9 PM - 10 PM",
  ];

  const bookedTimeSlots = []; // You can fetch the booked slots for a given day

  useEffect(() => {
    if (booking) {
      // Update the selectedDate to dayjs object on initial load
      setSelectedDate(
        booking.selectedDate ? dayjs(booking.selectedDate) : null
      );
      setSelectedTime(booking.selectedTime);
      setSelectedSeats(booking.selectedSeats);
    }
  }, [booking]);

  const handleDateChange = (newValue) => {
    setSelectedDate(newValue); // Store the dayjs object directly

    // Format date to "DD-MM-YYYY" for API and other logic
    const formattedDate = newValue ? newValue.format("DD-MM-YYYY") : "";
    getBookingSlots(formattedDate); // Fetch available slots based on the selected date
  };

  const getBookingSlots = (date) => {
    // Logic to fetch available slots based on the selected date
    console.log("Fetching slots for date:", date);
  };

  const handleChipClick = (time) => {
    if (!bookedTimeSlots.includes(time)) {
      setSelectedTime(time);
    }
  };

  const handleSliderChange = (event, newValue) => {
    setSelectedSeats(newValue);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}editBooking/${booking._id}`,
        { selectedDate, selectedTime, selectedSeats }
      );
      if (response?.data?.message === "Booking updated successfully.") {
        enqueueSnackbar("Booking updated successfully!", {
          variant: "success",
        });
        handleClose();
      } else {
        enqueueSnackbar("Failed to update the booking.", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("Error updating booking.", { variant: "error" });
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6">Edit Booking</Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ mb: 3 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={["DatePicker"]}>
                  <DatePicker
                    label="Select Date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    sx={{ width: "100%" }}
                    format="DD-MM-YYYY" // Ensure consistent formatting
                    disablePast
                  />
                </DemoContainer>
              </LocalizationProvider>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Select Time
            </Typography>
            <Grid container spacing={1}>
              {timeSlots.map((eachTime) => (
                <Grid item key={eachTime}>
                  <Chip
                    color={selectedTime === eachTime ? "primary" : "default"}
                    onClick={() => handleChipClick(eachTime)}
                    label={eachTime}
                    clickable
                    disabled={bookedTimeSlots.includes(eachTime)}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Select Seats
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Group color="primary" />
              <Slider
                value={selectedSeats}
                onChange={handleSliderChange}
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={20}
                sx={{ ml: 2, flex: 1 }}
              />
            </Box>
          </Grid>
        </Grid>

        <Grid container justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
          <Grid item>
            <Button variant="outlined" color="secondary" onClick={handleClose}>
              Cancel
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "1000px",
  maxHeight: "90vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
};
