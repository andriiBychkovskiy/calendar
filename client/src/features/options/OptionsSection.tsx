import React, { useState } from 'react';
import {
  Box, Typography, IconButton, TextField, Button, Tooltip,
  Accordion, AccordionSummary, AccordionDetails, Collapse,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import { ColorPicker } from '@shared/ui/ColorPicker/ColorPicker';

interface OptionItem {
  id: string;
  value: string;
  color?: string;
}

interface OptionGroup {
  id: string;
  title: string;
  items: OptionItem[];
}

interface OptionsSectionProps {
  title: string;
  itemLabel: string;
  groups: OptionGroup[];
  onAddGroup: (title: string) => void;
  onUpdateGroup: (groupId: string, title: string) => void;
  onRemoveGroup: (groupId: string) => void;
  onAddItem: (groupId: string, value: string) => void;
  onUpdateItem: (groupId: string, itemId: string, value: string) => void;
  onUpdateItemColor: (groupId: string, itemId: string, color: string) => void;
  onRemoveItem: (groupId: string, itemId: string) => void;
}

export const OptionsSection: React.FC<OptionsSectionProps> = ({
  title, itemLabel, groups,
  onAddGroup, onUpdateGroup, onRemoveGroup,
  onAddItem, onUpdateItem, onUpdateItemColor, onRemoveItem,
}) => {
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupTitle, setEditingGroupTitle] = useState('');
  const [newItemValues, setNewItemValues] = useState<Record<string, string>>({});
  const [editingItem, setEditingItem] = useState<{ groupId: string; itemId: string } | null>(null);
  const [editingItemValue, setEditingItemValue] = useState('');
  const [pendingDelete, setPendingDelete] = useState<
    | { type: 'group'; groupId: string }
    | { type: 'item'; groupId: string; itemId: string }
    | null
  >(null);

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === 'group') {
      onRemoveGroup(pendingDelete.groupId);
    } else {
      onRemoveItem(pendingDelete.groupId, pendingDelete.itemId);
    }
    setPendingDelete(null);
  };

  const handleAddGroup = () => {
    if (!newGroupTitle.trim()) return;
    onAddGroup(newGroupTitle.trim());
    setNewGroupTitle('');
    setShowNewGroup(false);
  };

  const handleStartEditGroup = (groupId: string, currentTitle: string) => {
    setEditingGroupId(groupId);
    setEditingGroupTitle(currentTitle);
  };

  const handleSaveEditGroup = (groupId: string) => {
    if (editingGroupTitle.trim()) onUpdateGroup(groupId, editingGroupTitle.trim());
    setEditingGroupId(null);
    setEditingGroupTitle('');
  };

  const handleAddItem = (groupId: string) => {
    const value = newItemValues[groupId]?.trim();
    if (!value) return;
    onAddItem(groupId, value);
    setNewItemValues((prev) => ({ ...prev, [groupId]: '' }));
  };

  const handleStartEditItem = (groupId: string, itemId: string, currentValue: string) => {
    setEditingItem({ groupId, itemId });
    setEditingItemValue(currentValue);
  };

  const handleSaveEditItem = () => {
    if (!editingItem || !editingItemValue.trim()) return;
    onUpdateItem(editingItem.groupId, editingItem.itemId, editingItemValue.trim());
    setEditingItem(null);
    setEditingItemValue('');
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5, px: 0.5 }}>
        {title}
      </Typography>

      {groups.map((group) => (
        <Accordion key={group.id} defaultExpanded disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px !important', mb: 1, '&::before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 36 }} />} sx={{ minHeight: 40, px: 1.5, '& .MuiAccordionSummary-content': { my: 0.5 } }}>
            {editingGroupId === group.id ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, mr: 1 }} onClick={(e) => e.stopPropagation()}>
                <TextField
                  value={editingGroupTitle}
                  onChange={(e) => setEditingGroupTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEditGroup(group.id)}
                  size="small"
                  variant="standard"
                  autoFocus
                  InputProps={{ disableUnderline: false, sx: { fontSize: '0.875rem', fontWeight: 600 } }}
                  sx={{ flex: 1 }}
                />
                <IconButton size="small" onClick={() => handleSaveEditGroup(group.id)} sx={{ color: 'primary.main' }}>
                  <CheckIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>{group.title}</Typography>
                <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex' }}>
                  <IconButton size="small" onClick={() => handleStartEditGroup(group.id, group.title)} sx={{ color: 'text.secondary' }}>
                    <EditOutlinedIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                  <Tooltip title={group.items.length > 0 ? 'Remove all items before deleting the group' : ''} placement="top">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => setPendingDelete({ type: 'group', groupId: group.id })}
                        disabled={group.items.length > 0}
                        sx={{ color: group.items.length > 0 ? 'action.disabled' : 'error.main' }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Box>
            )}
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 1.5, px: 1.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mb: 1 }}>
              {group.items.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {editingItem?.groupId === group.id && editingItem?.itemId === item.id ? (
                    <>
                      <ColorPicker
                        value={item.color}
                        onChange={(color) => onUpdateItemColor(group.id, item.id, color)}
                      />
                      <TextField
                        value={editingItemValue}
                        onChange={(e) => setEditingItemValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEditItem()}
                        size="small"
                        variant="standard"
                        autoFocus
                        fullWidth
                        InputProps={{ disableUnderline: false, sx: { fontSize: '0.875rem' } }}
                      />
                      <IconButton size="small" onClick={handleSaveEditItem} sx={{ color: 'primary.main' }}>
                        <CheckIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <ColorPicker
                        value={item.color}
                        onChange={(color) => onUpdateItemColor(group.id, item.id, color)}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          flex: 1,
                          fontSize: '0.875rem',
                          color: item.color || 'text.primary',
                        }}
                      >
                        {item.value}
                      </Typography>
                      <IconButton size="small" onClick={() => handleStartEditItem(group.id, item.id, item.value)} sx={{ color: 'text.secondary' }}>
                        <EditOutlinedIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => setPendingDelete({ type: 'item', groupId: group.id, itemId: item.id })} sx={{ color: 'error.main' }}>
                        <DeleteOutlineIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </>
                  )}
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TextField
                placeholder={`Add ${itemLabel}…`}
                value={newItemValues[group.id] ?? ''}
                onChange={(e) => setNewItemValues((prev) => ({ ...prev, [group.id]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem(group.id)}
                size="small"
                variant="outlined"
                fullWidth
                InputProps={{ sx: { fontSize: '0.8125rem', borderRadius: 1.5 } }}
              />
              <IconButton size="small" onClick={() => handleAddItem(group.id)} sx={{ color: 'primary.main', border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}>
                <CheckIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      <Collapse in={showNewGroup}>
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
          <TextField
            placeholder="Group name"
            value={newGroupTitle}
            onChange={(e) => setNewGroupTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
            size="small"
            variant="outlined"
            fullWidth
            autoFocus
            InputProps={{ sx: { fontSize: '0.875rem', borderRadius: 1.5 } }}
          />
          <Button variant="contained" size="small" onClick={handleAddGroup} sx={{ px: 2, flexShrink: 0 }}>
            Add
          </Button>
        </Box>
      </Collapse>

      <Button
        startIcon={<AddIcon sx={{ fontSize: 15 }} />}
        onClick={() => setShowNewGroup((v) => !v)}
        size="small"
        sx={{ color: 'primary.main', fontWeight: 500, px: 0.5, '&:hover': { background: 'transparent', opacity: 0.8 } }}
      >
        Add group
      </Button>

      <Dialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          {pendingDelete?.type === 'group' ? 'Delete group?' : 'Delete item?'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {pendingDelete?.type === 'group'
              ? 'Are you sure you want to delete this group? This action cannot be undone.'
              : 'Are you sure you want to delete this item? This action cannot be undone.'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setPendingDelete(null)}
            sx={{ flex: 1, py: 1, borderColor: 'divider', color: 'text.primary' }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            sx={{ flex: 1, py: 1 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
