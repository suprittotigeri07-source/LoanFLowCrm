from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import (
    CustomLoginView, CurrentUserProfileView, TelecallerListView, AsmListView,
    CreateTelecallerAPIView, CreateAsmAPIView, ResendCredentialsAPIView,
    ResetPasswordAPIView, ChangePasswordAPIView, ToggleUserStatusAPIView,
    DownloadUserTemplateAPIView, ValidateExcelUserImportAPIView, ImportExcelUsersAPIView,
    DeleteUserAPIView, RestoreUserAPIView
)
from customers.views import (
    LeadViewSet, TelecallerQueueView, CsvLeadUploadView, LeadAssignmentView
)
from calls.views import (
    CallDispositionView, TodayFollowUpsView, OverdueFollowUpsView, CompleteFollowUpView
)
from analytics.views import TelecallerDashboardView, AdminDashboardView

router = DefaultRouter()
router.register(r'leads', LeadViewSet, basename='lead')

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication & User Management
    path('api/auth/login/', CustomLoginView.as_view(), name='auth_login'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='auth_token_refresh'),
    path('api/auth/me/', CurrentUserProfileView.as_view(), name='auth_me'),

    # User Management & Excel Bulk Upload Endpoints
    path('api/users/telecallers/', TelecallerListView.as_view(), name='telecallers_list'),
    path('api/users/asms/', AsmListView.as_view(), name='asms_list'),
    path('api/users/create-telecaller/', CreateTelecallerAPIView.as_view(), name='create_telecaller'),
    path('api/users/create-asm/', CreateAsmAPIView.as_view(), name='create_asm'),
    path('api/users/excel-template/', DownloadUserTemplateAPIView.as_view(), name='users_excel_template'),
    path('api/users/import-excel-preview/', ValidateExcelUserImportAPIView.as_view(), name='users_import_excel_preview'),
    path('api/users/import-excel/', ImportExcelUsersAPIView.as_view(), name='users_import_excel'),
    path('api/users/<uuid:pk>/resend-credentials/', ResendCredentialsAPIView.as_view(), name='resend_credentials'),
    path('api/users/<uuid:pk>/reset-password/', ResetPasswordAPIView.as_view(), name='reset_password'),
    path('api/users/<uuid:pk>/toggle-status/', ToggleUserStatusAPIView.as_view(), name='toggle_user_status'),
    path('api/users/<uuid:pk>/delete/', DeleteUserAPIView.as_view(), name='delete_user'),
    path('api/users/<uuid:pk>/restore/', RestoreUserAPIView.as_view(), name='restore_user'),
    path('api/users/change-password/', ChangePasswordAPIView.as_view(), name='change_password'),

    # Lead Upload & Management
    path('api/leads/telecaller-queue/', TelecallerQueueView.as_view(), name='telecaller_queue'),
    path('api/leads/upload-csv/', CsvLeadUploadView.as_view(), name='leads_upload_csv'),
    path('api/leads/assign/', LeadAssignmentView.as_view(), name='leads_assign'),
    path('api/', include(router.urls)),

    # Calling & Disposition Workflows
    path('api/calls/disposition/', CallDispositionView.as_view(), name='call_disposition'),
    path('api/follow-ups/today/', TodayFollowUpsView.as_view(), name='follow_ups_today'),
    path('api/follow-ups/overdue/', OverdueFollowUpsView.as_view(), name='follow_ups_overdue'),
    path('api/follow-ups/<uuid:pk>/complete/', CompleteFollowUpView.as_view(), name='follow_up_complete'),

    # Dashboards & Analytics
    path('api/analytics/telecaller/', TelecallerDashboardView.as_view(), name='analytics_telecaller'),
    path('api/analytics/admin/', AdminDashboardView.as_view(), name='analytics_admin'),
]
