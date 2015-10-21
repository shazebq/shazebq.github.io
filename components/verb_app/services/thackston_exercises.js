var app = angular.module('verbApp');

// General verb related helper data
app.factory('thackstonExercises', function() {

    var data = {};

    data.exercises =   [
        {
            question: 'قال له إني آتيك بما أمرتني به قبل أن تقوم من مقامك',
            answer: 'قَالَ لَهُ إِنِّي آتِيكَ بِمَا أَمَرْتَنِي بِهِ قَبْلَ أَنْ تُقُومَ مِنْ مَقَامِكَ',
            chapter: 18
        },
        {
            question: 'ما كان لنفس أن تموت إلا بإذن الله',
            answer: 'مَا كَانَ لِنفسٍ أَنْ تَمُوتَ إِلََّا بِإِذْنِ اللهِ',
            chapter: 18
        },
        {
            question: 'فقال الملك لمريم أنا رسول ربك لأهب لك ولدًا',
            answer: 'فَقَالَ الْمَلَكُ لِمَرْيَمَ أَنَا رَسُولُ رَبِّكِ لِأَهِبَ لَكِ وَلَدًا',
            chapter: 18
        },
        {
            question: 'أيودّ أحدكم أن تكون له جنة من نخيل وأعناب',
            answer: 'أَيَوَدُّ أَحَدُكُمْ أَنْ تَكُونَ لَهُ جَنَّةٌ مِنْ نَخِيلٍ وَأَعْنَابٍ',
            chapter: 18
        },
        {
            question: 'أعبد ربي حتى يأتيني اليقين',
            answer: 'أَعْبُدُ رَبِّي حَتَّىٰ يَأْتِيَنِيَ الْيَقِينُ',
            chapter: 18
        },
        {
            question: 'يا ربنا وسعت كل شيء رحمة وعلما',
            answer: 'يَا رَبَّنَا وَسِعْتَ كَلَّ شَيْءٍ رَحْمَةً وَعِلْمًا',
            chapter: 18
        },
        {
            question: 'ما يكون لنا أن نعدكم بذلك',
            answer: 'مَا يَكُونُ لَنَا أَنْ نَعِدَكُمْ بِذٰلِكَ',
            chapter: 18
        },
        {
            question: 'فإن الأخوين جاءا ليرثا أباهما',
            answer: 'فَإِنَّ الْأَخَوَينِ جَاءَا لِيَرِثَا أَبَاهُمَا',
            chapter: 18
        },
        {
            question: 'أمرني الشيطان أن أقرب الكفار',
            answer: 'أَمَرَنِي الشَّيطَانُ أَنْ أقْرَبَ الْكُفَّارَ',
            chapter: 18
        },
        {
            question: 'قالت بنو إسرائيل يا موسى لن نصبر على طعام واحد',
            answer: 'قَالَتْ بَنُو إِسْرَائِيلَ يَا مُوسَىٰ لَنْ نَصْبِرَ عَلَىٰ طَعَامٍ وَاحِدٍ',
            chapter: 18
        },
        {
            question: 'أمرني أن أكون من المؤمنين',
            answer: 'أَمَرَنِي أَنْ أَكُونَ مِنَ َالْمُؤْمِنِينَ',
            chapter: 18
        },
        {
            question: 'أتنهانا أن نعبد ما يعبد آباؤنا',
            answer: 'أَتَنْهَانَا أَنْ نَعْبُدَ مَا يَعْبُدُ آبَاؤُنَا',
            chapter: 18
        },
        {
            question: 'قال الله لإبليس ما منعك ألا تسجد لما خلقت بيدي',
            answer: 'قَالَ اللهُ لِإِبْلِيسَ مَا مَنَعَكَ أَلَّا تَسْجُدَ لِمَا خَلَقْتُ بِيَدِي',
            chapter: 18
        },
        {
            question: 'نهونا أن نأكل من فواكه أشجار حدائقهم فنكون من الظالمين',
            answer: 'نَهَونَا أَنْ نَأْكُلَ مِنْ فَوَاكِهِ أَشْجَارِ حَدَائِقِهِمْ فَنَكُونَ مِنَ الظَّالِمِينَ',
            chapter: 18
        },
        {
            question: 'وقلنا لهم اسكنوا هذه القرية وكلوا منها حيث شئتم',
            answer: 'وَقُلْنََا لَهُمْ اُسْكُنُوَا هَذِهِ الْقَرْيَةَ وَكُلُوَا مِنْهَا حَيْثُ شِئْتُمْ',
            chapter: 19
        },
        {
            question: 'ففروا إلى الله إني لكم منه نذير مبين',
            answer: 'فَفِرُّوَا إِلَىٰ اللهِ إِنِّي لَكُمْ مِنْهُ نَذِيرٌ مُبِينٌ',
            chapter: 19
        },
        {
            question: 'ما تسقط من ورق إلا يعلمها',
            answer: 'مَا تَسْقُطُ مِنْ وَرَقٍ إِلَّا يَعْلَمُهَا',
            chapter: 19
        },
        {
            question: 'لا تبعث مالك إليهم حتى تعلم أهم أتقياء أم لا',
            answer: 'لَا تَبْعَثْ مَالَكَ إِلَيهِمْ حَتَّىٰ تَعْلَمَ أَهُمْ أَتْقِيَاءُ أَمْ لَا',
            chapter: 19
        },
        {
            question: 'فقالت نساء مصر إنا لنرى زليخا في ضلال مبين فلما سمعت بقولهن دعتهن وقالت ليوسف اخرج عليهن فلما رأينه قلن ليس هذا بشرًا إن هذا إلا ملك كريم',
            answer: 'فَقَالَتْ نِسَاءُ مِصْرَ إِنَّا لَنَرَىٰ زُلَيخَا فِي ضَلَالٍ مُبِينٍ فَلَمَّا سَمِعَتْ بِقَوْلِهِنَّ دَعَتْهُنَّ وَقَالَتْ لِيُوسُفَ اُخْرُجْ عَلَيهِنَّ فَلَمَّا رَأَينَهُ قُلْنَ لَيسَ هٰذَا بَشَرًا إِنْ هٰذَا إِلَّا مَلَكٌ كَرِيمٌ',
            chapter: 19
        },
        {
            question: 'سوف يعلمون، حين يرون العذاب، من أضل',
            answer: 'سَوفَ يَعْلَمُونَ، حِينَ يَرَونَ الْعَذَابَ، مَنْ أَضَلُّ',
            chapter: 19
        },
        {
            question: 'يا ربنا اغفر لنا وارحمنا وأنت أرحم الراحمين',
            answer: 'يَا رَبَّنَا اِغْفِرْ لَنَا وَاِرْحَمْنَا وَأَنْتَ أَرْحَمُ الرَّاحِمِينَ',
            chapter: 19
        },
        {
            question: 'يا أيها الناس اذكروا الله ذكرا كثيرا',
            answer: 'يَا أَيُّهَا النَّاسُ اُذْكُرُوا اللهَ ذِكْرًا كَثِيرًا',
            chapter: 19
        },
        {
            question: 'هو الله أحد لم يلد',
            answer: 'هُوَ اللهُ أحَدٌ لَمْ يَلِدْ',
            chapter: 19
        },
        {
            question: 'فعلمنا منه ما لم نعلم',
            answer: 'فَعَلِمْنَا مِنْهُ مَا لَمْ نَعْلَمْ',
            chapter: 19
        },
        {
            question: 'فخذها بالقوة وأمر قومك أن يأخذوا أموال الناس',
            answer: 'فَخُذْهَا بِالْقُوَّةِ وَأْمُرْ قَومَكَ أَنْ يَأخُذُوا أَمْوَالَ النَّاسِ',
            chapter: 19
        },
        {
            question: 'أولم تنصحنا ألا نقرب الذين هم أشد منا وهم مارّون على مدينتنا',
            answer: 'أَوَلَمْ تَنْصَحْنَا أَلَّا نَقْرَبَ الَّذِينَ هُمْ أَشَدُّ مِنَّا وَهُمْ مَارُّونَ عَلَىٰ مَدِينَتِنَا',
            chapter: 19
        },
        {
            question: 'قال إبليس يا آدم هل أدلك على شجرة الخلد',
            answer: 'قَالَ إِبْلِيسُ يَا آدَمُ هَلْ أَدُلُّكَ عَلَىٰ شَجَرَةِ الْخُلْدِ',
            chapter: 20
        },
        {
            question: 'فليقم من مقامه وليدع الظالمين لينصحوه',
            answer: 'فَلْيَقُمْ مِنْ مَقَامِهِ وَلْيَدْعُ الظَّالِمِينَ لِيَنْصَحُوهُ',
            chapter: 20
        },
        {
            question: 'اعبد الله كأنك تراه',
            answer: 'اُعْبُدِ اللهَ كَأَنَّكَ تَرَاهُ',
            chapter: 20
        },
        {
            question: 'يا أبتي إني قد جاءني من العلم ما لم يأتك',
            answer: 'يَا أَبَتِي إِنِّي قَدْ جَاءَنِي مِنَ الْعِلْمِ مَا لَمْ يَأْتِكَ',
            chapter: 20
        },
        {
            question: 'إن أمتي أمة مرحومة ليس عليها في الآخرة عذاب إنما عذابها في الدنيا',
            answer: 'إِنَّ أُمَّتِي أُمَّةٌ مَرْحُومَةٌ لَيسَ عَلَيهَا فِي الْآخِرَةِ عَذَابٌ إِنَّمَا عَذَابُهَا فِي الدُّنْيَا',
            chapter: 20
        },
        {
            question: 'ألم يأتهم نبأ الذين من قبلهم من قوم نوح',
            answer: 'أَلَمْ يَأْتِهِمْ نَبَأُ الَّذِينَ مِنْ قَبْلِهِمْ مِنْ قَومِ نُوحٍ',
            chapter: 20
        },
        {
            question: 'يا ربي اهد قومي فإنهم لا يعلمون',
            answer: 'يَا رَبِّي اِهْدِ قَوْمِي فَإِنَّهُمْ لَا يَعْلَمُونَ',
            chapter: 20
        },
        {
            question: 'لما لم تدللهم ولم تهدهم إذ بدا لك أنهم قد ضلوا',
            answer: 'لِمَا لَمْ تَدْلُلْهُمْ وَلَمْ تَهْدِهِمْ إِذْ بَدَا لَكَ أَنَّهُمْ قَدْ ضَلُّوا',
            chapter: 20
        },
        {
            question: 'فلما جاءه وقص عليه القصص قال لا تخف',
            answer: 'فَلَمَّا جَاءَهُ وَقَصَّ عَلَيهِ الْقِصَصَ قَالَ لَا تَخَفْ',
            chapter: 20
        },
        {
            question: 'لم نكن من الذين خسروا متاع الدنيا',
            answer: 'لَمْ نَكُنْ مِنَ الَّذِينَ خَسِرُوا مَتَاعَ الدُّنْيَا ',
            chapter: 20
        },
        {
            question: 'كفرنا بكم وبدا بيننا وبينكم العداوة',
            answer: 'كَفَرْنَا بِكُمْ وَبَدَا بَينَنَا وَبَينَكُمُ الْعَدَاوَةُ',
            chapter: 20
        },
        {
            question: 'فقال يعقوب ليوسف قال يا إبني لا تقصص رؤياك على إخوتك',
            answer: 'فَقَالَ يَعْقُوبُ لِيُوسُفَ قَالَ يا إِبْنِي لَا تَقْصُصْ رُؤْيَاكَ عَلَىٰ إِخْوَتِكَ',
            chapter: 20
        },
        {
            question: 'ألم تر كيف فعل ربك بذلك القوم',
            answer: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِذٰلِكَ الْقَوْمِ',
            chapter: 20
        },
        {
            question: 'أولم يسيروا في الأرض فينظروا كيف كان عاقبة الذين من قبلهم وكانوا أشد منهم قوة',
            answer: 'أَوَلَمْ يَسِيرُوَا فِي الْأرْضِ فَيَنْظُرُوا كَيفَ كَانَ عَاقِبَةُ الَّذِينَ مِنْ قَبْلِهِمْ وَكَانُوا أَشَدَّ مِنْهُمْ قُوَّةً',
            chapter: 20
        },
        {
            question: 'لا تدع مع الله إلهًا آخر فتكون من الكافرين',
            answer: 'لَا تَدْعُ مَعَ اللهِ إِلهًا آخَرَ فَتَكُونَ مِنَ الْكَافِرِينَ',
            chapter: 20
        },
        {
            question: 'ألم ينظروا إلى السماء فوقهم كيف بنيناها',
            answer: 'أَلَمْ يَنْظُرُوا إِلَىٰ السَّمَاءِ فَوقَهُمْ كَيفَ بَنَينَاهَا',
            chapter: 20
        },
        {
            question: 'إن الخاسرين الذين خسروا أنفسهم وأهليهم يوم القيامة ألا ذلك هو الخسران المبين',
            answer: 'إِنَّ الْخَاسِرِينَ الَّذِينَ خَسِرُوا أَنْفُسَهُمْ وَأَهْلِيهِمْ يَومَ الْقِيَامَةِ أَلَا ذَلِكَ هُوَ الْخُسْرَانُ الْمُبِينُ',
            chapter: 20
        },
        {
            question: '',
            answer: '',
            chapter: 21
        },
        {
            question: '',
            answer: '',
            chapter: 21
        },
        {
            question: '',
            answer: '',
            chapter: 21
        },
    ]

    // Will result in [{name: 1}, {name: 2}...]
    data.chapters = getChapters();

    function getChapters() {
        //var nums = _.range(18,41);
        var nums = _.range(18,20);
        return _.map(nums, function(num) {
            return {name: num};
        })
    }

    return data;
})



