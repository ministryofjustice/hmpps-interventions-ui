import datetime
import os.path
import random
import string
import sys
import uuid

random.seed()

NUM_DRAFT_REFERRALS = 50
NUM_SENT_REFERRALS = 100
PERCENTAGE_OF_SENT_REFERRALS_WHICH_ARE_ASSIGNED_TO_A_CASEWORKER = 75
NUM_ENDED_REFERRALS = 0

COMPLETION_DEADLINE_RANGE = (datetime.date(2021, 6, 24), datetime.date(2022, 6, 24))

service_providers = [
    ('HARMONY_LIVING', 'Harmony Living', 'harmony@example.com'),
    ('BETTER_LTD', 'Better Ltd.', 'better@example.com'),
    ('HELPING_HANDS', 'Helping Hands', 'helping-hands@example.com'),
    ('HOME_TRUST', 'Home Trust', 'home-trust@example.com'),
    ('NEW_BEGINNINGS', 'New Beginnings Ltd.', 'new-beginnings@example.com'),
    ('SAFE_LIVING', 'Safe Living Ltd.', 'safe-living@example.com'),
]

contracts = [
   # emotional wellbeing service in cleveland
   ('952eb687-a4a7-43b1-9d93-1b1a0c8cee5e', '8221a81c-08b2-4262-9c1a-0ab3c82cec8c', 'BETTER_LTD', '2021-06-24', '2022-06-24', None, 'cleveland', False, True, 18, None),
   # ETE service for all of yorkshire
   ('21ef4732-73e6-486b-832c-9f49165d40ab', 'ca374ac3-84eb-4b91-bea7-9005398f426f', 'SAFE_LIVING', '2021-06-24', '2022-06-24', 'C', None, False, True, 18, None),
   # accommodation service for the midlands
   ('7f5a2fb5-e3af-4395-9f38-c7c23dd8bec0', '428ee70f-3001-4399-95a6-ad25eaaede16', 'HARMONY_LIVING', '2021-06-24', '2022-06-24', 'F', None, False, True, 18, None),
   # ETE service for the midlands
   ('9653676a-a51f-48cf-8541-444af11fe18b', 'ca374ac3-84eb-4b91-bea7-9005398f426f', 'NEW_BEGINNINGS', '2021-06-24', '2022-06-24', 'F', None, False, True, 18, None),
]

interventions = [
    (
        '0e4dcc37-e3f5-4c44-b043-887dda3a2baa',
        '952eb687-a4a7-43b1-9d93-1b1a0c8cee5e',
        '2021-03-19',
        'Emotional Wellbeing',
        'Supporting services users around all areas of PW to enhance motivation and allow opportunity for SU change. The project consists of various external 1:1/group work activity across the region which directly link to SU outcome expectation.',
    ),
    (
        'ecdc6c7e-f04b-49b1-871d-3f9618555c3d',
        '21ef4732-73e6-486b-832c-9f49165d40ab',
        '2021-03-19',
        'Employment, Training & Education',
        '''Support to secure employment, qualifications, training opportunities for people on release from custody or serving a community order. Pre and post-release support available.

Our service assesses the ETE needs and interests of individuals referred to us and jointly with them we develop an action plan for success. We offer a range of interventions from light touch information, advice and guidance for those seeking a career change or wanting to develop their skills, through to intensive bespoke activities for those furthest from the job market.

Initially we will work on building a persons knowledge , confidence , motivation and desire to access ETE activities and interventions and will maintain this focus throughout their time with us on the Programme. Tailored 1-1 and groupwork interventions as well as access to a bespoke online learning portal that participants can access (all supported by mentors if required) are all designed to enable them to develop their skills and knowledge.

We source and manage a range of voluntary placements with a diverse range of large employers, social enterprise, community groups and training providers that participants can access when ready, which enables them to gain real work experience, tangible skills and the confidence and motivation to make the leap into full time employment and education.

Our Community Partnership Network engages with employers and colleges across the region to ensure we have access to the latest jobs, courses and opportunities that we can signpost people to and support them to get there.

We focus on the individual, provide wrap around support at the appropriate level and our aim is to motivate, mentor and to enable people to make a 'step change' in their lives.''',
    ),
    (
        '5f0a4d93-c26e-439d-b261-0d8d6338e77f',
        '7f5a2fb5-e3af-4395-9f38-c7c23dd8bec0',
        '2021-03-19',
        'Accommodation',
        '''Home Trust Ltd. offers support with sourcing and/or sustaining appropriate accommodation. We offer a range of interventions to help with all accommodation-related support needs.

We offer face-to-face advice, guidance and support to adult males (incl. young adult males), to secure and/or maintain suitable, settled accommodation (for a minimum 3-month period). This service is available to those who will be released from custody within the next 12 weeks and those already on licence in the community.

Each referred client will be allocated a case worker who will work closely with them and their Probation Officer to assess needs and barriers and agree a detailed, individualised action plan.

Interventions may include:
  • liaising with landlords to sustain existing tenancies
  • referrals to housing providers and/or the local authority
  • support to access the private rented sector
  • building independence through the delivery of group work and courses (e.g. how to be a good tenant)''',
    ),
    (
        '11f06a1d-da75-4ca3-bb39-b7e848fb7612',
        '9653676a-a51f-48cf-8541-444af11fe18b',
        '2021-03-19',
        'Employment, Training & Education',
        '''New Beginnings will provide ETE services to empower and motivate SUs to develop towards and take up education, training and employment.

• Benefits advice, including Better Off Calculations, so people have a clear understanding of the impact of training/work on their benefits
• Support offered face-to-face, digitally, one-to-one and in groups, dependent on need and risk
• Access to vacancies already secured with employers for whom a criminal conviction is not a barrier to employment
• Funded training opportunities e.g. short adult education units, qualifications, full apprenticeships
• Careers advice, including selecting appropriate sectors reflecting offending type, differing methods of securing work inc use of technology to increase during and post-Lockdowns
• Further advice on how/when to disclose convictions to potential employers
• The opportunity receive support from people with lived experience''',
    ),
]

sp_user_ids_with_username_and_organization = [
    ('5a2c772f-07b9-4c95-93f0-e320f41e7d12', 'JONATHAN.CULLING@DIGITAL.JUSTICE.GOV.UK', 'NEW_BEGINNINGS'),
    ('8737d791-bc74-4ffe-b383-1c1bd00ff8af', 'GEORGE.GREEN@DIGITAL.JUSTICE.GOV.UK', 'BETTER_LTD'),
    ('990d1f4f-963d-4faa-9f71-740c96ddf51f', 'TMYERS_ADM_AUTH', 'BETTER_LTD'),
    ('20e87c94-cea2-472c-95a3-9a5a5e988910', 'TMYERS_GEN_AUTH', 'NEW_BEGINNINGS'),
    ('263efae0-493d-4e0d-aa49-33f765902c65', 'GEORGE.EATON@DIGITAL.JUSTICE.GOV.UK', 'HARMONY_LIVING'),
    ('878533e7-8fde-4c61-a827-57d9e17b08ca', 'RAJIV.MAHAL@DIGITAL.JUSTICE.GOV.UK', 'HARMONY_LIVING'),
    ('de7e3a11-2df1-4f53-a2ac-c592f3ca235f', 'LAWRENCE.FOROOGHIAN@DIGITAL.JUSTICE.GOV.UK', 'SAFE_LIVING'),
    ('9f68324d-4067-4038-a4bd-a54c5935273c', 'RFORSYTH', 'SAFE_LIVING'),
]

pp_user_ids_with_username = [
    ('2500104586', 'TomMyersDevl')
]

service_category_reference_codes = {
    '428ee70f-3001-4399-95a6-ad25eaaede16': 'AC',
    'ca374ac3-84eb-4b91-bea7-9005398f426f': 'ED',
    '96a63c39-4371-4f17-a6ec-265755f0cf7b': 'FI',
    '76bcdb97-1dea-41c1-a4f8-899d88e5d679': 'DR',
    'b84f4eb7-4db0-477e-8c59-21027b3262c5': 'LI',
    '9556a399-3529-4993-8030-41db2090555e': 'FA',
    '8221a81c-08b2-4262-9c1a-0ab3c82cec8c': 'EM',
    'c036826e-f077-49a5-8b33-601dca7ad479': 'SO',
}

service_category_complexity_levels = {
    '428ee70f-3001-4399-95a6-ad25eaaede16': [
        'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
        '110f2405-d944-4c15-836c-0c6684e2aa78',
        'c86be5ec-31fa-4dfa-8c0c-8fe13451b9f6',
    ],
    'ca374ac3-84eb-4b91-bea7-9005398f426f': [
        '0d6a7e24-2c61-4ca7-ac09-ec6f754dc6e5',
        'ab17dc4a-3f93-4ae5-a70d-2905b86b256c',
        '439c6dab-0dd6-4eb9-8a4a-c69d3490e940',
    ],
    '96a63c39-4371-4f17-a6ec-265755f0cf7b': [
        '178ec337-0ec9-422c-b9da-ea969fdcf98a',
        'd771ae5e-01d4-43b0-a941-99b2c0c52d29',
        '65a682a7-9621-4dab-8040-08f3109321f8',
    ],
    '76bcdb97-1dea-41c1-a4f8-899d88e5d679': [
        '5392858e-3432-40cb-b277-4552e8ac4638',
        'f6a063e4-7daa-4cf6-9042-22476f8b5ed9',
        'cf1fb9d3-5092-42dd-b8da-d9cedf96addc',
    ],
    'b84f4eb7-4db0-477e-8c59-21027b3262c5': [
        'a8860894-2610-4070-aa66-72089417ceb2',
        '707a0244-6bfe-4f0a-80d9-5e79498e81a8',
        '005566a2-ca85-471c-9ac0-38f3aa749092',
    ],
    '9556a399-3529-4993-8030-41db2090555e': [
        'ddc8ee4a-403e-47cc-9af1-815938429bbc',
        '8e409327-e3ab-4c91-9300-2f61a409789f',
        '52ca5958-56c6-4ae3-99ca-86180265f717',
    ],
    '8221a81c-08b2-4262-9c1a-0ab3c82cec8c': [
        'cb6f1c1c-29d4-4d34-902e-3c89ee8428a0',
        '46c1ae33-f90b-4dfc-83f7-6eec49209084',
        '64a1b7ba-305e-4bcc-b427-01b575ace941',
    ],
    'c036826e-f077-49a5-8b33-601dca7ad479': [
        '85aa5a57-62d3-4b9d-9642-248e7be4bebc',
        '64eb3c83-c562-4a63-9182-68a3a7725463',
        'f1eebd5e-4a0f-457e-b1a8-62e8c7de1afd',
    ],
}

service_category_desired_outcomes = {
    '428ee70f-3001-4399-95a6-ad25eaaede16': [
        '301ead30-30a4-4c7c-8296-2768abfb59b5',
        '65924ac6-9724-455b-ad30-906936291421',
        '9b30ffad-dfcb-44ce-bdca-0ea49239a21a',
        'e7f199de-eee1-4f57-a8c9-69281ea6cd4d',
        '19d5ef58-5cfc-41fe-894c-acd705dc1325',
        'f6f70273-16a2-4dc7-aafc-9bc74215e713',
        '449a93d7-e705-4340-9936-c859644abd52',
        '55a9cf76-428d-4409-8a57-aaa523f3b631',
    ],
    'ca374ac3-84eb-4b91-bea7-9005398f426f': [
        '8f438eb1-4f5c-4c23-9436-2ef784fb2426',
        'd45e5b8f-7ae3-4fed-8c6b-73959cfc1190',
        '42077326-ca07-40ea-af20-902249af844e',
        '0541193e-ba84-46e7-973f-82a9900d7521',
    ],
    '96a63c39-4371-4f17-a6ec-265755f0cf7b': [
        '018e8ef3-9645-4712-898e-c913e2bb5bd9',
        '8955e0a0-e7ee-469a-be1a-2561d39f65cd',
        '716229b3-ca55-4779-8e0f-759d5a67fa17',
        '9b47bdfa-8c1b-428f-9e7d-aa5441394ec0',
        '5524a64c-3ff4-48fe-b32f-9d61131e2289',
    ],
    '76bcdb97-1dea-41c1-a4f8-899d88e5d679': [
        '8341f53f-2e16-4af2-b928-92c9b24c902a',
        'ccc39f3c-a2d0-484b-81f3-0db847e337a8',
        '4fe2e6e2-8e24-4a17-ac3a-9ccbc2aca394',
        '7f38a11e-8375-491d-9b61-fc28c397cb6b',
        '535793e3-073e-47ff-a701-63942d0026b8',
        'c8f7b418-2d54-4f3c-8beb-c9ce2b4ca34e',
        'b8219e7a-8ca0-4ea4-a577-3cbb0aae34f9',
        '9462c7cb-0305-40e8-a68c-cf92b9dbda94',
        '99de9424-c54a-40fd-b32c-da51fb9b126b',
        '5783aa24-48ac-430a-8143-87a0de663152',
    ],
    '9556a399-3529-4993-8030-41db2090555e': [
        '1ffe903f-0aea-4ad0-8fe2-6e58b7ec0324',
        '868f713a-5c53-4a18-b20f-ff8f118e9c30',
        'dd7e2bb6-4374-405a-9524-432aefd63a70',
        'fdf33edf-dd73-4649-88d5-330805124dd7',
        'f2a1026d-dcb7-4d8b-a227-3f6615ca3b80',
    ],
    'b84f4eb7-4db0-477e-8c59-21027b3262c5': [
        'f45e26a8-65d4-4acf-bee4-fd6d0f5cf1e5',
        'f2aa2f28-27b5-4e79-856e-6a3f19550b20',
        'fdabad61-446a-47cc-b100-7a56b41f7812',
        'c19081d3-75f5-4ff1-bd37-e29a3bb1618d',
        'c8aa564d-12ba-4479-9f07-4a6a60fb3bbf',
    ],
    '8221a81c-08b2-4262-9c1a-0ab3c82cec8c': [
        '52a658f6-622b-491e-8085-cea58c9b015b',
        '2b6e54d3-1cf7-4fc7-aae2-2f338085feda',
        '4fc163c9-f8fb-4cfd-b107-2cb13583ebf0',
        'ce7a55cc-d179-49d8-b7ab-6e8d93024ead',
        '117832ca-f65e-4cce-9cdd-bdf666e740ea',
        '6277c89b-28ca-49bd-8411-bf3d461a96f2',
    ],
    'c036826e-f077-49a5-8b33-601dca7ad479': [
        'b820cdf3-164b-427d-b78e-1fb079851ebd',
        'ae6c90d3-a59e-46e7-b81f-6003179611ef',
        'ad79e9c1-3c08-4d84-9241-ffb6f06054c7',
    ],
}

intervention_ids = [
    '0e4dcc37-e3f5-4c44-b043-887dda3a2baa',
    'ecdc6c7e-f04b-49b1-871d-3f9618555c3d',
    '5f0a4d93-c26e-439d-b261-0d8d6338e77f',
    '11f06a1d-da75-4ca3-bb39-b7e848fb7612',
]

intervention_service_categories = {
    '0e4dcc37-e3f5-4c44-b043-887dda3a2baa': '8221a81c-08b2-4262-9c1a-0ab3c82cec8c',
    'ecdc6c7e-f04b-49b1-871d-3f9618555c3d': 'ca374ac3-84eb-4b91-bea7-9005398f426f',
    '5f0a4d93-c26e-439d-b261-0d8d6338e77f': '428ee70f-3001-4399-95a6-ad25eaaede16',
    '11f06a1d-da75-4ca3-bb39-b7e848fb7612': 'ca374ac3-84eb-4b91-bea7-9005398f426f',
}

intervention_organizations = {
    '0e4dcc37-e3f5-4c44-b043-887dda3a2baa': 'BETTER_LTD',
    'ecdc6c7e-f04b-49b1-871d-3f9618555c3d': 'SAFE_LIVING',
    '5f0a4d93-c26e-439d-b261-0d8d6338e77f': 'HARMONY_LIVING',
    '11f06a1d-da75-4ca3-bb39-b7e848fb7612': 'NEW_BEGINNINGS',
}

su_details = {
    'X388807': {
        'title': 'Mr',
        'firstName': 'Alex',
        'lastName': 'River',
        'dateOfBirth': None,
        'gender': 'Male',
        'ethnicity': None,
        'preferredLanguage': None,
        'religionOrBelief': None,
        'disabilities': None,
    }
}

# taken roughly from https://en.wikipedia.org/wiki/Languages_of_the_United_Kingdom
languages, weights = zip(*[
    ('Polish', 10),
    ('Punjabi', 5),
    ('Urdu', 5),
    ('Bengali', 4),
    ('Gujarati', 4),
    ('Arabic', 3),
    ('French', 3),
    ('Chinese', 3),
    ('British Sign Language', 2),
    ('Portuguese', 2),
    ('Spanish', 2),
    ('Tamil', 2),
    ('Turkish', 2),
    ('Italian', 2),
    ('Somali', 2),
    ('Lithuanian', 2),
    ('German', 1),
    ('Persian', 1),
    ('Romanian', 1),
])


def sql_format(x):
    if type(x) is str:
        x = x.replace("'", "''")
        x = x.replace('\n', "' || chr(10) || '")
        return f"'{x}'"
    elif x is None:
        return 'null'
    elif type(x) is bool:
        return 'true' if x else 'false'
    elif type(x) is int:
        return str(x)
    elif type(x) is datetime.date:
        return sql_format(str(x))
    elif type(x) is datetime.datetime:
        return sql_format(x.strftime("%Y-%m-%d %H:%M:%S.%f+00"))
    elif type(x) is uuid.UUID:
        return sql_format(str(x))
    elif type(x) is list:
        return sql_format(f"{{{','.join(x)}}}")
    else:
        raise RuntimeError(f"can't format var with type '{type(x)}' ({x})")


def random_bool():
    return random.choice([True, False])


def random_date_between(d1, d2):
    today = datetime.date.today()

    if d1 < today or d2 < today:
        raise RuntimeError("dates can't be in the past")

    if d2 < d1:
        raise RuntimeError("d2 should be after d1")

    return today + datetime.timedelta(random.randint((d1 - today).days, (d2 - today).days))


def random_when_unavailable():
    day_of_the_week = random.choice(['Weekday', 'Weekend', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    start_time = random.randint(9, 15)
    end_time = random.randint(start_time, 20)
    reason = random.choice([
        'childcare responsibilities',
        'work',
        'regular hospital appointments'
    ])

    return f'{day_of_the_week}s between {start_time}:00 and {end_time}:00 due to {reason}.'


def generate_reference_number(service_category_id):
    # don't care about ambiguous pairs right now
    letters = lambda k: ''.join(random.choices(string.ascii_uppercase, k=k))
    numbers = lambda k: ''.join(random.choices(string.digits, k=k))
    return f'{letters(2)}{numbers(4)}{service_category_reference_codes[service_category_id]}'


if __name__ == '__main__':
    if len(sys.argv) == 1:
        raise RuntimeError("please pass a path to write the migration files to")

    migrations_dir = lambda f: os.path.join(sys.argv[1], f)
    sql_values_line = lambda line: '(' + ','.join(map(sql_format, line)) + ')'
    sql_values = lambda values: ',\n'.join(sql_values_line(line) for line in values) + ';'

    with open(migrations_dir('V100_0__service_providers.sql'), 'w') as f:
        f.write("""insert into service_provider
            (id, name, incoming_referral_distribution_email)
        values
        """)

        f.write(sql_values(service_providers))

    with open(migrations_dir('V100_1__df_contracts.sql'), 'w') as f:
        f.write("""insert into dynamic_framework_contract
            (id, service_category_id, service_provider_id, start_date, end_date, nps_region_id, pcc_region_id, allows_female, allows_male, minimum_age, maximum_age)
        values
        """)

        f.write(sql_values(contracts))

    with open(migrations_dir('V100_2__interventions.sql'), 'w') as f:
        f.write("""insert into intervention
            (id, dynamic_framework_contract_id, created_at, title, description)
        values
        """)
        f.write(sql_values(interventions))

    auth_users = (u[:2] + ('auth', ) for u in sp_user_ids_with_username_and_organization)

    with open(migrations_dir('V100_3_0__auth_users.sql'), 'w') as f:
        f.write("""insert into auth_user
            (id, user_name, auth_source)
        values
        """)

        f.write(sql_values(auth_users))

    delius_users = (u + ('delius', ) for u in pp_user_ids_with_username)

    with open(migrations_dir('V100_3_1__delius_users.sql'), 'w') as f:
        f.write("""insert into auth_user
            (id, user_name, auth_source)
        values
        """)

        f.write(sql_values(delius_users))

    referrals = []
    for i in range(NUM_DRAFT_REFERRALS + NUM_SENT_REFERRALS + NUM_ENDED_REFERRALS):
        fields = []

        referral_id = uuid.uuid4()
        created_at = datetime.datetime.utcnow()
        created_by_id = random.choice(pp_user_ids_with_username)[0]
        service_usercrn = random.choice(list(su_details.keys()))
        intervention_id = random.choice(intervention_ids)
        service_category_id = intervention_service_categories[intervention_id]
        organization = intervention_organizations[intervention_id]

        complexity_levelid = random.choice(service_category_complexity_levels[service_category_id])
        completion_deadline = random_date_between(*COMPLETION_DEADLINE_RANGE)

        needs_interpreter = random_bool()
        interpreter_language = random.choices(languages, weights, k=1)[0] if needs_interpreter else None

        has_additional_responsibilities = random_bool()
        when_unavailable = random_when_unavailable() if has_additional_responsibilities else None

        using_rar_days = random_bool()
        maximum_rar_days = random.randint(1, 10) if using_rar_days else None

        # core fields
        fields.extend([referral_id, created_at, created_by_id, service_usercrn, intervention_id])

        # draft fields
        fields.extend([complexity_levelid, completion_deadline])
        fields.extend(['', '', '', ''])
        fields.extend([needs_interpreter, interpreter_language])
        fields.extend([has_additional_responsibilities, when_unavailable])
        fields.extend([using_rar_days, maximum_rar_days])

        # sent fields
        if (i >= NUM_DRAFT_REFERRALS):
            reference_number = generate_reference_number(service_category_id)
            sent_at = created_at # this doesn't really matter
            sent_by_id = created_by_id

            assigned = random.random() < PERCENTAGE_OF_SENT_REFERRALS_WHICH_ARE_ASSIGNED_TO_A_CASEWORKER / 100.
            sp_users = list(filter(lambda x: x[2] == organization, sp_user_ids_with_username_and_organization))
            assigned_at = sent_at if assigned else None
            assigned_by_id = random.choice(sp_users)[0] if assigned else None
            assigned_to_id = random.choice(list(filter(lambda x: x != assigned_by_id, sp_users)))[0] if assigned else None

            fields.extend([reference_number, sent_at, sent_by_id])
            fields.extend([assigned_at, assigned_by_id, assigned_to_id])

        # ended fields
        if (i >= NUM_DRAFT_REFERRALS + NUM_SENT_REFERRALS):
            # todo...
            pass

        referrals.append(fields)

    # fill out any missing 'sent' or 'ended' fields with null values
    max_number_of_referral_values = len(max(referrals, key=len))
    for values in referrals:
        values.extend([None] * (max_number_of_referral_values - len(values)))

    with open(migrations_dir('V100_4_0__referrals.sql'), 'w') as f:
        f.write("""insert into referral
            (id, created_at, created_by_id, service_usercrn, intervention_id,
            complexity_levelid, completion_deadline,
            further_information, accessibility_needs, additional_needs_information, additional_risk_information,
            needs_interpreter, interpreter_language,
            has_additional_responsibilities, when_unavailable,
            using_rar_days, maximum_rar_days,
            reference_number,
            sent_at, sent_by_id,
            assigned_at, assigned_by_id, assigned_to_id)
        values
        """)

        f.write(sql_values(referrals))


    # argh these magic numbers are the worst, this is getting out of control...
    referral_service_user_data = [[referral[0]] + list(su_details[referral[3]].values()) for referral in referrals]

    with open(migrations_dir('V100_4_1__referral_service_user_data.sql'), 'w') as f:
        f.write("""insert into referral_service_user_data
            (referral_id, title, first_name, last_name, dob, gender, ethnicity, preferred_language, religion_or_belief, disabilities)
        values
        """)

        f.write(sql_values(referral_service_user_data))

    referral_desired_outcomes = []
    for r in referrals:
        service_category = intervention_service_categories[r[4]]
        desired_outcomes_for_service_category = service_category_desired_outcomes[service_category]
        desired_outcomes = random.sample(desired_outcomes_for_service_category, k=random.randint(1, len(desired_outcomes_for_service_category)))
        for desired_outcome in desired_outcomes:
            referral_desired_outcomes.append([r[0], desired_outcome])

    with open(migrations_dir('V100_4_2__referral_desired_outcomes.sql'), 'w') as f:
        f.write("""insert into referral_desired_outcome
            (referral_id, desired_outcome_id)
        values
        """)

        f.write(sql_values(referral_desired_outcomes))
