const API_URL = 'http://localhost:5000';

// Simple default avatar in base64 format (light gray circle with person icon)
const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFNUU3RUIiIHJ4PSI1MCIvPjxwYXRoIGQ9Ik03My4xMDcsNzIuMDg5YzAsMCwwLjgwNC0xMC4wNDUsMC44MDQtMTMuMzkzYzAtMy4zNDktMS42MDctNi42OTctNC44MjEtNi42OTdjLTMuMjE0LDAtMjUuNzEzLDAtMzguNTcsMGMtMy4yMTQsMC00LjgyMSwzLjM0OC00LjgyMSw2LjY5N2MwLDMuMzQ4LDAuODA0LDEzLjM5MywwLjgwNCwxMy4zOTMiIGZpbGw9IiM5Q0EzQUYiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM2LjE2MSIgcj0iMTQuNDY0IiBmaWxsPSIjOUNBM0FGIi8+PC9zdmc+';

export const getProfilePictureUrl = (profilePicture) => {
  if (!profilePicture) return DEFAULT_AVATAR;
  if (profilePicture.startsWith('http')) return profilePicture;
  return `${API_URL}${profilePicture}`;
}; 