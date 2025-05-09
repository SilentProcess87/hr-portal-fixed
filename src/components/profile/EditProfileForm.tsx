import React, { useState } from 'react';
import { Employee } from '@/lib/api-models';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface EditProfileFormProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEmployee: Employee) => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ 
  employee, 
  isOpen, 
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: employee.name,
    position: employee.position,
    department: employee.department,
    email: employee.email,
    phone: employee.phone,
    location: employee.location,
    status: employee.status,
    manager: employee.manager,
    salary: employee.salary,
    bio: employee.bio
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(employee.avatar || '');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and empty string
    if (value === '' || /^\d+$/.test(value)) {
      setFormData(prev => ({ ...prev, salary: value === '' ? 0 : parseInt(value, 10) }));
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('userId', employee.id.toString());
    
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/profile/upload-avatar', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        setAvatarUrl(result.file.path);
        setFormData(prev => ({ ...prev, avatar: result.file.path }));
        toast.success('Profile picture uploaded successfully');
      } else {
        toast.error('Failed to upload profile picture', {
          description: result.message || 'Unknown error',
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload profile picture', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await apiService.updateEmployee(employee.id, formData);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      toast.success('Profile updated successfully');
      onSave(response.data);
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile', {
        description: error instanceof Error ? error.message : 'Please try again later'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="onleave">On Leave</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manager">Manager</Label>
              <Input
                id="manager"
                name="manager"
                value={formData.manager}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                name="salary"
                type="text"
                value={formData.salary?.toString() || ''}
                onChange={handleSalaryChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="avatar">Profile Picture</Label>
              <div className="flex flex-col space-y-2">
                {avatarUrl && (
                  <div className="mb-2">
                    <img
                      src={avatarUrl}
                      alt="Profile Preview"
                      className="w-32 h-32 object-cover rounded-full border"
                    />
                  </div>
                )}
                <Input
                  id="avatarFile"
                  name="avatarFile"
                  type="file"
                  onChange={handleFileUpload}
                  className="file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-primary/90 file:text-primary-foreground hover:file:bg-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Upload a profile picture (VULNERABLE: Any file type is accepted, including .js files)
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileForm; 