import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

type Props = {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmationDialog = ({ open, title, message, onConfirm, onCancel }: Props) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Peruuta
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Poista
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog; 