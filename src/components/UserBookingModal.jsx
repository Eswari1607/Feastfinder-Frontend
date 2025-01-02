import {
  Modal,
  Box,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import EditBooking from "./EditBooking"; // Import EditBooking modal

export default function UserBookingModal({ handleClose, open }) {
  const [bookingData, setBookingData] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  // State for editing a booking
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Get user info from localStorage
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const { _id: userId, email } = userInfo;

  useEffect(() => {
    fetchBookingDetails();
  }, []);

  const fetchBookingDetails = async () => {
    try {
      const endpoint =
        email === "admin@gmail.com"
          ? `${import.meta.env.VITE_BACKEND_URL}all-bookings`
          : `${import.meta.env.VITE_BACKEND_URL}bookings/${userId}`;

      const response = await axios.get(endpoint);
      if (response?.data) {
        setBookingData(response.data);
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      enqueueSnackbar("Failed to fetch booking details!", { variant: "error" });
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}updateBooking/${bookingId}`,
        { status }
      );

      if (response?.data?.message === "Booking updated successfully.") {
        enqueueSnackbar(`Booking ${status} successfully!`, {
          variant: "success",
        });
        fetchBookingDetails(); // Refresh the data after status update
      } else {
        enqueueSnackbar(
          response?.data?.message || "Failed to update booking.",
          {
            variant: "error",
          }
        );
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      enqueueSnackbar("Failed to update the booking!", { variant: "error" });
    }
  };

  const renderActionButtons = (row) => {
    if (email === "admin@gmail.com") {
      if (row.status === "pending") {
        return (
          <>
            <Grid item>
              <Button
                variant="contained"
                color="success"
                onClick={() => updateBookingStatus(row._id, "booked")}
              >
                Accept
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="error"
                onClick={() =>
                  updateBookingStatus(row._id, "cancelled_by_admin")
                }
              >
                Reject
              </Button>
            </Grid>
          </>
        );
      }
      if (row.status === "booked") {
        return (
          <Button variant="contained" color="success">
            Accepted
          </Button>
        );
      }
      if (
        row.status === "cancelled_by_user" ||
        row.status === "cancelled_by_admin"
      ) {
        return (
          <Button variant="contained" color="info">
            Cancelled
          </Button>
        );
      }
    } else {
      if (row.status === "pending") {
        return (
          <>
            <Grid item>
              <Button variant="contained" color="warning" disabled>
                Pending
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="error"
                onClick={() =>
                  updateBookingStatus(row._id, "cancelled_by_user")
                }
              >
                Cancel
              </Button>
            </Grid>
          </>
        );
      }
      if (row.status === "booked") {
        return (
          <>
            <Button variant="contained" color="success" disabled>
              Accepted
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => updateBookingStatus(row._id, "cancelled_by_user")}
            >
              Cancel
            </Button>
          </>
        );
      }
      if (
        row.status === "cancelled_by_user" ||
        row.status === "cancelled_by_admin"
      ) {
        return (
          <Button variant="contained" color="info" disabled>
            Cancelled
          </Button>
        );
      }
    }
  };

  const handleOpenEditModal = (row) => {
    setSelectedBooking(row);
    setOpenEditModal(true);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography variant="h4">Booking Details</Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="caption table">
              <TableHead>
                <TableRow>
                  <TableCell>User Name</TableCell>
                  <TableCell>User Email</TableCell>
                  <TableCell>Hotel ID</TableCell>
                  <TableCell align="right">Date</TableCell>
                  <TableCell align="right">Seats</TableCell>
                  <TableCell align="right">Time</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookingData.length > 0 ? (
                  bookingData.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell>{row.userName}</TableCell>
                      <TableCell>{row.userEmail}</TableCell>
                      <TableCell>{row.hotelId}</TableCell>
                      <TableCell align="right">{row.selectedDate}</TableCell>
                      <TableCell align="right">{row.selectedSeats}</TableCell>
                      <TableCell align="right">{row.selectedTime}</TableCell>
                      <TableCell align="right">
                        <Grid container spacing={2}>
                          {renderActionButtons(row)}
                          {/* Edit Button (only show if not canceled) */}
                          {row.status !== "cancelled_by_user" &&
                            row.status !== "cancelled_by_admin" && (
                              <Grid item>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={() => handleOpenEditModal(row)}
                                >
                                  Edit Booking
                                </Button>
                              </Grid>
                            )}
                        </Grid>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No bookings found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Modal>

      {/* Edit Booking Modal */}
      <EditBooking
        open={openEditModal}
        handleClose={() => setOpenEditModal(false)}
        booking={selectedBooking}
      />
    </>
  );
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  height: "80%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 3,
  overflowY: "auto",
  borderRadius: 2,
};
