import React from 'react';
import {
  Box, Typography, Checkbox, IconButton, Button,
  Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import type { ChecklistItem } from '@shared/types';

interface TasksAccordionProps {
  mode: 'create' | 'view' | 'copy';
  items: ChecklistItem[];
  onToggle?: (idx: number) => void;
  onRemove: (idx: number) => void;
  onAddClick: () => void;
}

export const TasksAccordion: React.FC<TasksAccordionProps> = ({
  mode, items, onToggle, onRemove, onAddClick,
}) => {
  const showCheckboxes = mode === 'view';
  const showAddButton = mode !== 'copy';

  return (
    <Accordion defaultExpanded disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px !important', mb: 1.5, '&::before': { display: 'none' } }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ fontSize: 36 }} />}
        sx={{ minHeight: 44, px: 2, '& .MuiAccordionSummary-content': { my: 0.75 } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckBoxOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Tasks
          </Typography>
          {items.length > 0 && (
            <Typography variant="caption" sx={{ color: 'text.secondary', bgcolor: 'grey.100', px: 0.75, borderRadius: 1 }}>
              {items.length}
            </Typography>
          )}
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 0, pb: 1.5, px: 2 }}>
        {items.length === 0 && !showAddButton && (
          <Typography variant="body2" sx={{ color: 'text.secondary', py: 0.5, fontSize: '0.8125rem' }}>
            No tasks selected.
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          {items.map((item, idx) => (
            <Box key={item._id ?? idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 0.25 }}>
              <Checkbox
                checked={showCheckboxes ? item.completed : false}
                onChange={() => onToggle?.(idx)}
                disabled={!showCheckboxes}
                size="small"
                sx={{ flexShrink: 0, p: 0.5 }}
              />
              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  fontSize: '0.875rem',
                  color: item.completed ? 'text.disabled' : 'text.primary',
                  textDecoration: item.completed ? 'line-through' : 'none',
                }}
              >
                {item.text}
              </Typography>
              <IconButton
                size="small"
                onClick={() => onRemove(idx)}
                sx={{ color: 'error.main', flexShrink: 0, '&:hover': { opacity: 0.7, background: 'transparent' } }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Box>
          ))}
        </Box>

        {showAddButton && (
          <Button
            startIcon={<AddIcon sx={{ fontSize: 15 }} />}
            onClick={onAddClick}
            size="small"
            sx={{ color: 'primary.main', fontWeight: 500, px: 0.5, mt: items.length > 0 ? 0.5 : 0, '&:hover': { background: 'transparent', opacity: 0.8 } }}
          >
            Add task
          </Button>
        )}
      </AccordionDetails>
    </Accordion>
  );
};
