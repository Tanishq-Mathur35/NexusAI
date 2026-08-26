import { create } from 'zustand';
import { resumeService } from '../services/api.js';

const useResumeStore = create((set, get) => ({
    resumes: [],
    selectedResume: null,
    atsResult: null,
    isLoading: false,
    isUploading: false,

    fetchResumes: async () => {
        set({ isLoading: true });

        try {
            const { data } = await resumeService.getAll();

            set({
                resumes: data.resumes || [],
                isLoading: false,
            });
        } catch {
            set({
                isLoading: false,
            });
        }
    },

    uploadResume: async (file) => {
        set({ isUploading: true });

        try {
            const form = new FormData();
            form.append('resume', file);

            const { data } = await resumeService.upload(form);

            set((state) => ({
                resumes: [data.resume, ...state.resumes],
                selectedResume: data.resume,
                isUploading: false,
            }));

            return {
                success: true,
                resume: data.resume,
            };
        } catch (error) {
            set({
                isUploading: false,
            });

            return {
                success: false,
                error:
                    error.response?.data?.error ||
                    'Upload failed',
            };
        }
    },

    analyzeATS: async (
        resumeId,
        jobDescription,
        jobTitle
    ) => {
        set({ isLoading: true });

        try {
            const { data } =
                await resumeService.analyzeATS({
                    resumeId,
                    jobDescription,
                    jobTitle,
                });

            set({
                atsResult: data.analysis,
                isLoading: false,
            });

            return {
                success: true,
                analysis: data.analysis,
            };
        } catch (error) {
            set({
                isLoading: false,
            });

            return {
                success: false,
                error: error.response?.data?.error,
            };
        }
    },

    deleteResume: async (id) => {
        try {
            await resumeService.delete(id);

            set((state) => ({
                resumes: state.resumes.filter(
                    (resume) => resume._id !== id
                ),
                selectedResume:
                    state.selectedResume?._id === id
                        ? null
                        : state.selectedResume,
            }));

            return {
                success: true,
            };
        } catch {
            return {
                success: false,
            };
        }
    },

    selectResume: (resume) =>
        set({
            selectedResume: resume,
        }),

    clearATS: () =>
        set({
            atsResult: null,
        }),
}));

export default useResumeStore;
