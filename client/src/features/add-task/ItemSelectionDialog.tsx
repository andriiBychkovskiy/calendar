import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, Checkbox, Collapse, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface SelectionItem {
  id: string;
  value: string;
  color?: string;
}

export interface SelectionGroup {
  id: string;
  title: string;
  items: SelectionItem[];
}

interface ItemSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  groups: SelectionGroup[];
  alreadySelectedIds: Set<string>;
  onConfirm: (items: SelectionItem[]) => void;
}

export const ItemSelectionDialog: React.FC<ItemSelectionDialogProps> = ({
  open, onClose, title, groups, alreadySelectedIds, onConfirm,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Reset selection and expand all groups each time dialog opens
  useEffect(() => {
    if (!open) return;
    setSelectedIds(new Set());
    setExpandedGroups(new Set(groups.map((g) => g.id)));
  // groups identity changes when dialog switches between task/expense — intentional
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleToggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(groupId) ? next.delete(groupId) : next.add(groupId);
      return next;
    });
  };

  const handleConfirm = () => {
    const selected = groups.flatMap((g) => g.items).filter((item) => selectedIds.has(item.id));
    onConfirm(selected);
    onClose();
  };

  const hasAvailableItems = groups.some((g) =>
    g.items.some((item) => !alreadySelectedIds.has(item.id))
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{title}</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0, pb: 0, px: 2, maxHeight: 360, overflowY: 'auto' }}>
        {!hasAvailableItems ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}>
            No options available. Add some in Options.
          </Typography>
        ) : (
          groups.map((group) => {
            const availableItems = group.items.filter((item) => !alreadySelectedIds.has(item.id));
            if (availableItems.length === 0) return null;
            const isExpanded = expandedGroups.has(group.id);
            return (
              <Box key={group.id} sx={{ mb: 0.5 }}>
                <Box
                  onClick={() => handleToggleGroup(group.id)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.5,
                    py: 0.75, cursor: 'pointer', borderRadius: 1,
                    '&:hover': { bgcolor: 'grey.50' },
                  }}
                >
                  <ExpandMoreIcon
                    sx={{
                      fontSize: 16, color: 'text.secondary',
                      transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {group.title}
                  </Typography>
                </Box>
                <Collapse in={isExpanded}>
                  {availableItems.map((item) => (
                    <Box
                      key={item.id}
                      onClick={() => handleToggleItem(item.id)}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 0.5,
                        pl: 2.5, py: 0.25, cursor: 'pointer', borderRadius: 1,
                        '&:hover': { bgcolor: 'grey.50' },
                      }}
                    >
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        size="small"
                        sx={{ p: 0.5, flexShrink: 0 }}
                        onChange={() => handleToggleItem(item.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Collapse>
              </Box>
            );
          })
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2, pt: 1.5, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} sx={{ flex: 1, py: 0.75, borderColor: 'divider', color: 'text.primary' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={selectedIds.size === 0}
          sx={{ flex: 1, py: 0.75 }}
        >
          Add selected
        </Button>
      </DialogActions>
    </Dialog>
  );
};
