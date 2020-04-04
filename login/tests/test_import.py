import logging

from django.conf import settings
from django.urls import reverse
from django.utils.translation import activate

from django.contrib.auth.models import User

from login.tests.setup_data import TestSetup

logger = logging.getLogger(__name__)


class TestModels(TestSetup):

    def test_import(self):
        # GET the import form
        response = self.client.get('/en/auth/user/import/', follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'import.html')
        self.assertContains(response, 'form action=""')

        # POST the import form
        input_format = '0'
        filename = os.path.join(
            os.path.dirname(__file__),
            os.path.pardir,
            'login',
            'tests',
            'users.csv')
        with open(filename, "rb") as f:
            data = {
                'input_format': input_format,
                'import_file': f,
            }
            response = self.client.post('/en/auth/user/import/', data)
        self.assertEqual(response.status_code, 200)
        self.assertIn('result', response.context)
        self.assertFalse(response.context['result'].has_errors())
        self.assertIn('confirm_form', response.context)
        confirm_form = response.context['confirm_form']

        data = confirm_form.initial
        self.assertEqual(data['original_file_name'], 'users.csv')
        response = self.client.post('/en/auth/user/process_import/', data,
                                    follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response,
                            _('Import finished, with {} new and {} updated {}.').format(
                                1, 0, User._meta.verbose_name_plural)
                            )

